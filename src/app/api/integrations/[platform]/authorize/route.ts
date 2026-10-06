import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { decryptProviderCredentials, encryptOAuthTokens } from "@/lib/auth";
import { createAuthorizationUrl, getOAuthAppCredentials, getOAuthProviderConfig, getSocialPlatform } from "@/lib/oauth";
import { getAppRedirectUrl } from "@/lib/redirect-url";
import { readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  const user = await requireCustomer();
  const { platform: platformSlug } = await params;
  const platform = getSocialPlatform(platformSlug);
  if (!platform) return NextResponse.json({ error: "Unsupported platform" }, { status: 404 });
  if (platform === "WhatsApp") return NextResponse.redirect(new URL("/integrations/whatsapp", request.url));

  const store = readStore();
  let account = store.socialAccounts.find((entry) => entry.workspaceId === user.workspaceId && entry.platform === platform);
  const provider = getOAuthProviderConfig(platform);
  if (!provider) return NextResponse.json({ error: "This platform does not support this authorization flow." }, { status: 409 });
  const credentials = getOAuthAppCredentials(platform)
    ?? (account?.credentialsEncrypted ? decryptProviderCredentials(account.credentialsEncrypted) : null);
  if (!credentials) return NextResponse.json({ error: "This platform's app credentials have not been configured by the administrator." }, { status: 503 });
  if (account?.connected) return NextResponse.redirect(getAppRedirectUrl("/integrations?connection=already-connected", request.url));

  if (!account) {
    account = {
      id: `social-${randomUUID()}`,
      workspaceId: user.workspaceId,
      platform,
      accountName: `${platform} account`,
      connected: false,
      configured: true,
    };
    store.socialAccounts.push(account);
  }

  const state = randomBytes(32).toString("base64url");
  const stateHash = createHash("sha256").update(state).digest("hex");
  const codeVerifier = provider.pkce ? randomBytes(48).toString("base64url") : undefined;
  const codeChallenge = codeVerifier ? createHash("sha256").update(codeVerifier).digest("base64url") : undefined;
  const redirectUri = getAppRedirectUrl("/api/integrations/callback", request.url).toString();
  const authorizationUrl = createAuthorizationUrl(platform, credentials.clientId, redirectUri, state, codeChallenge);

  store.oauthStates = store.oauthStates.filter((entry) => Date.parse(entry.expiresAt) > Date.now());
  store.oauthStates.push({
    id: `oauth-${randomUUID()}`,
    stateHash,
    workspaceId: user.workspaceId,
    userId: user.id,
    accountId: account.id,
    platform,
    codeVerifierEncrypted: codeVerifier ? encryptOAuthTokens({ accessToken: codeVerifier }) : undefined,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  writeStore(store);
  return NextResponse.redirect(authorizationUrl);
}
