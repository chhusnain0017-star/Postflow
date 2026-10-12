import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { encryptOAuthTokens } from "@/lib/auth";
import { getOAuthAppCredentials } from "@/lib/oauth";
import { getAppRedirectUrl } from "@/lib/redirect-url";
import { readStore, writeStore } from "../../../../../tests/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const credentials = getOAuthAppCredentials("YouTube");
  if (!credentials) {
    return NextResponse.redirect(getAppRedirectUrl("/login?error=google-not-configured", request.url));
  }

  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const store = readStore();
  store.googleLoginStates = (store.googleLoginStates ?? []).filter((entry) => Date.parse(entry.expiresAt) > Date.now());
  store.googleLoginStates.push({
    id: `google-login-${randomUUID()}`,
    stateHash: createHash("sha256").update(state).digest("hex"),
    codeVerifierEncrypted: encryptOAuthTokens({ accessToken: verifier }),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  writeStore(store);

  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.searchParams.set("client_id", credentials.clientId);
  authorization.searchParams.set("redirect_uri", getAppRedirectUrl("/api/auth/google/callback", request.url).toString());
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", "openid email profile");
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("code_challenge", challenge);
  authorization.searchParams.set("code_challenge_method", "S256");
  authorization.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorization);
}
