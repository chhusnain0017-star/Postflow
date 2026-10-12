import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, decryptOAuthTokens } from "@/lib/auth";
import { addTrialPeriod } from "@/lib/billing";
import { getOAuthAppCredentials } from "@/lib/oauth";
import { getAppRedirectUrl } from "@/lib/redirect-url";
import { addAuditLog, readStore, writeStore } from "../../../../../../tests/store";

export const runtime = "nodejs";

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function loginRedirect(request: Request, error?: string) {
  const path = error ? `/login?error=${encodeURIComponent(error)}` : "/login";
  return NextResponse.redirect(getAppRedirectUrl(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code");
  if (!state || state.length > 256 || !code || url.searchParams.has("error")) {
    return loginRedirect(request, "google-cancelled");
  }

  const store = readStore();
  const stateHash = createHash("sha256").update(state).digest("hex");
  const stateIndex = store.googleLoginStates.findIndex(
    (entry) => entry.stateHash === stateHash && Date.parse(entry.expiresAt) > Date.now(),
  );
  if (stateIndex < 0) return loginRedirect(request, "google-state-expired");

  const loginState = store.googleLoginStates[stateIndex];
  store.googleLoginStates.splice(stateIndex, 1);
  writeStore(store);

  try {
    const credentials = getOAuthAppCredentials("YouTube");
    if (!credentials) throw new Error("Google sign-in is not configured.");
    const verifier = decryptOAuthTokens(loginState.codeVerifierEncrypted).accessToken;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: getAppRedirectUrl("/api/auth/google/callback", request.url).toString(),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!tokenResponse.ok) throw new Error("Google rejected the sign-in request.");
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) throw new Error("Google did not return an access token.");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!profileResponse.ok) throw new Error("Google profile verification failed.");
    const profile = await profileResponse.json() as GoogleProfile;
    const email = profile.email?.trim().toLowerCase();
    if (!profile.sub || !email || profile.email_verified !== true) {
      throw new Error("Google must provide a verified email address.");
    }

    const now = new Date();
    const adminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    let user = store.users.find((entry) => entry.googleSubject === profile.sub)
      ?? store.users.find((entry) => entry.email.toLowerCase() === email);

    if (user) {
      if (user.googleSubject && user.googleSubject !== profile.sub) {
        throw new Error("This email is already linked to another Google identity.");
      }
      if (user.status === "EXPIRED") {
        return NextResponse.redirect(getAppRedirectUrl("/upgrade?status=expired", request.url));
      }
      if (user.status === "SUSPENDED" || user.status === "REJECTED") {
        throw new Error("This account is not eligible to sign in.");
      }
      if (email === adminEmail && process.env.SUPER_ADMIN_PASSWORD && user.role !== "SYSTEM_ADMIN") {
        throw new Error("The configured administrator email is assigned to a customer account.");
      }
      user.googleSubject = profile.sub;
      user.name = profile.name?.trim().slice(0, 100) || user.name;
      user.avatarUrl = profile.picture;
      user.email = email;
      user.status = "APPROVED";
      if (!user.accessExpiryDate) {
        user.accessStartDate = now.toISOString();
        user.accessExpiryDate = addTrialPeriod(now).toISOString();
      }
    } else {
      const isAdmin = Boolean(adminEmail && process.env.SUPER_ADMIN_PASSWORD && email === adminEmail);
      user = {
        id: `user-${randomUUID()}`,
        name: profile.name?.trim().slice(0, 100) || email,
        email,
        passwordHash: "",
        role: isAdmin ? "SYSTEM_ADMIN" : "OWNER",
        status: "APPROVED",
        workspaceId: `workspace-${randomUUID()}`,
        googleSubject: profile.sub,
        avatarUrl: profile.picture,
        accessStartDate: now.toISOString(),
        accessExpiryDate: (isAdmin ? new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000) : addTrialPeriod(now)).toISOString(),
        createdAt: now.toISOString(),
      };
      store.users.push(user);
    }

    const sessionId = randomUUID();
    user.lastLogin = now.toISOString();
    user.activeSessionId = sessionId;
    writeStore(store);
    addAuditLog({
      workspaceId: user.workspaceId,
      userId: user.id,
      event: "Google Sign In",
      details: `${user.name} signed in with Google`,
    });

    const destination = user.role === "SYSTEM_ADMIN" ? "/admin" : user.termsAcceptedAt ? "/dashboard" : "/onboarding";
    const response = NextResponse.redirect(getAppRedirectUrl(destination, request.url));
    response.cookies.set("postflow_session", createSessionToken({
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
      role: user.role,
      sessionId,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return loginRedirect(request, "google-failed");
  }
}
