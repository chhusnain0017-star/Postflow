import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { decryptOAuthTokens, decryptProviderCredentials, encryptOAuthTokens } from "@/lib/auth";
import { getOAuthAppCredentials, getOAuthProviderConfig } from "@/lib/oauth";
import type { SocialPlatform } from "@/lib/platforms";
import { getAppRedirectUrl } from "@/lib/redirect-url";
import { addAuditLog, readStore, writeStore } from "@/lib/store";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

async function readJson(response: Response): Promise<JsonObject> {
  const value = await response.json().catch(() => ({})) as JsonObject;
  if (!response.ok) throw new Error("Provider authorization was rejected.");
  return value;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asSeconds(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

async function exchangeCode(platform: string, code: string, redirectUri: string, clientId: string, clientSecret: string, codeVerifier?: string) {
  const config = getOAuthProviderConfig(platform as SocialPlatform);
  if (!config) throw new Error("Unsupported provider.");
  const params = new URLSearchParams();
  params.set("code", code);

  if (platform === "Facebook") {
    const url = new URL(config.tokenUrl);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("client_secret", clientSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);
    return readJson(await fetch(url, { signal: AbortSignal.timeout(20000) }));
  }

  if (platform === "Instagram") {
    params.set("client_id", clientId);
    params.set("client_secret", clientSecret);
    params.set("grant_type", "authorization_code");
    params.set("redirect_uri", redirectUri);
    return readJson(await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(20000),
    }));
  }

  if (platform === "X" || platform === "Pinterest") {
    params.set("grant_type", platform === "X" ? "authorization_code" : "authorization_code");
    params.set("redirect_uri", redirectUri);
    if (platform === "X") {
      if (!codeVerifier) throw new Error("Missing PKCE verifier.");
      params.set("client_id", clientId);
      params.set("code_verifier", codeVerifier);
    }
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    return readJson(await fetch(config.tokenUrl, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(20000),
    }));
  }

  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("redirect_uri", redirectUri);
  if (platform === "YouTube") {
    params.set("grant_type", "authorization_code");
    if (!codeVerifier) throw new Error("Missing PKCE verifier.");
    params.set("code_verifier", codeVerifier);
  } else if (platform === "TikTok") {
    params.set("client_key", clientId);
    params.delete("client_id");
    params.set("grant_type", "authorization_code");
  } else if (platform === "Threads") {
    params.set("grant_type", "authorization_code");
  }

  return readJson(await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    signal: AbortSignal.timeout(20000),
  }));
}

async function fetchProviderProfile(platform: string, accessToken: string): Promise<{ id: string; name: string }> {
  const config = getOAuthProviderConfig(platform as SocialPlatform);
  if (!config) throw new Error("Unsupported provider.");
  const response = await fetch(config.profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(20000),
  });
  const payload = await readJson(response);
  const data = (payload.data && typeof payload.data === "object" ? payload.data : payload) as JsonObject;
  const id = asString(data.id) || asString(data.user_id) || asString(data.open_id);
  const name = asString(data.name) || asString(data.username) || asString(data.display_name) || asString(data.email);
  if (!id) throw new Error("Provider did not return an account identity.");
  return { id, name: name || `${platform} account` };
}

function integrationRedirect(request: Request, status: "connected" | "failed" | "denied") {
  return NextResponse.redirect(getAppRedirectUrl(`/integrations?connection=${status}`, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  if (!state || state.length > 256) return integrationRedirect(request, "failed");

  const store = readStore();
  const stateHash = createHash("sha256").update(state).digest("hex");
  const stateIndex = store.oauthStates.findIndex((entry) => entry.stateHash === stateHash && Date.parse(entry.expiresAt) > Date.now());
  if (stateIndex < 0) return integrationRedirect(request, "failed");
  const oauthState = store.oauthStates[stateIndex];
  store.oauthStates.splice(stateIndex, 1);
  writeStore(store);

  if (url.searchParams.has("error") || !url.searchParams.get("code")) return integrationRedirect(request, "denied");

  try {
    const callbackUser = store.users.find((entry) => entry.id === oauthState.userId && entry.workspaceId === oauthState.workspaceId);
    const expiry = callbackUser?.accessExpiryDate ? Date.parse(callbackUser.accessExpiryDate) : Number.POSITIVE_INFINITY;
    if (!callbackUser || callbackUser.status !== "APPROVED" || !Number.isFinite(expiry) && expiry !== Number.POSITIVE_INFINITY || Date.now() >= expiry) {
      throw new Error("The workspace contract is no longer active.");
    }

    const account = store.socialAccounts.find((entry) => entry.id === oauthState.accountId
      && entry.workspaceId === oauthState.workspaceId && entry.platform === oauthState.platform);
    const config = getOAuthAppCredentials(oauthState.platform as SocialPlatform)
      ?? (account?.credentialsEncrypted ? decryptProviderCredentials(account.credentialsEncrypted) : null);
    if (!account || !config || account.connected) throw new Error("The integration configuration changed.");

    const codeVerifier = oauthState.codeVerifierEncrypted
      ? decryptOAuthTokens(oauthState.codeVerifierEncrypted).accessToken
      : undefined;
    const redirectUri = getAppRedirectUrl("/api/integrations/callback", request.url).toString();
    const tokens = await exchangeCode(oauthState.platform, url.searchParams.get("code")!, redirectUri, config.clientId, config.clientSecret, codeVerifier);
    const tokenData = (tokens.data && typeof tokens.data === "object" ? tokens.data : tokens) as JsonObject;
    const accessToken = asString(tokenData.access_token);
    if (!accessToken) throw new Error("Provider did not return an access token.");

    const profile = await fetchProviderProfile(oauthState.platform, accessToken);
    account.connected = true;
    account.providerUserId = profile.id;
    account.accountName = profile.name;
    account.connectedAt = new Date().toISOString();
    account.tokenExpiresAt = asSeconds(tokenData.expires_in)
      ? new Date(Date.now() + asSeconds(tokenData.expires_in)! * 1000).toISOString()
      : undefined;
    account.accessTokenEncrypted = encryptOAuthTokens({
      accessToken,
      refreshToken: asString(tokenData.refresh_token) || undefined,
    });
    const scopeValue = asString(tokenData.scope) || asString(tokenData.scopes);
    account.grantedScopes = scopeValue ? scopeValue.split(/[\s,]+/).filter(Boolean) : undefined;
    writeStore(store);
    addAuditLog({ workspaceId: account.workspaceId, userId: oauthState.userId, event: "Social Account Connected", details: `${account.platform}: ${profile.name}` });
    return integrationRedirect(request, "connected");
  } catch {
    return integrationRedirect(request, "failed");
  }
}
