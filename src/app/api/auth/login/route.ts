import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, verifyPassword } from "@/lib/auth";
import { ensureConfiguredAdmin, readStore, upsertUser } from "@/lib/store";
import { getAppRedirectUrl } from "@/lib/redirect-url";

export async function POST(request: Request) {
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") ?? formData.get("email") ?? formData.get("superAdminEmail") ?? "").trim();
  const password = String(formData.get("password") ?? formData.get("superAdminPassword") ?? "");
  const loginMode = String(formData.get("loginMode") ?? "customer");

  if (loginMode !== "admin" && loginMode !== "customer") {
    return NextResponse.json({ error: "Invalid login option" }, { status: 400 });
  }
  let user;
  try {
    if (loginMode === "admin") {
      user = ensureConfiguredAdmin(
        String(formData.get("superAdminEmail") ?? identifier),
        String(formData.get("superAdminPassword") ?? password),
      );
    } else {
      user = readStore().users.find((entry) => entry.email.toLowerCase() === identifier.toLowerCase()
        || entry.username?.toLowerCase() === identifier.toLowerCase());
      if (!user || user.role === "SYSTEM_ADMIN" || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: "Invalid username/email or password" }, { status: 401 });
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid admin credentials or Super Admin environment is not configured" }, { status: 401 });
  }

  if (user.status === "EXPIRED") return NextResponse.redirect(getAppRedirectUrl("/waiting?status=expired", request.url));
  if (user.status !== "APPROVED") {
    return NextResponse.json({ error: "Account not active" }, { status: 403 });
  }
  if (user.accessExpiryDate) {
    const expiry = new Date(user.accessExpiryDate).getTime();
    if (!Number.isFinite(expiry) || Date.now() >= expiry) {
      user.status = "EXPIRED";
      delete user.activeSessionId;
      upsertUser(user);
      return NextResponse.redirect(getAppRedirectUrl("/waiting?status=expired", request.url));
    }
  }

  const sessionId = randomUUID();
  user.activeSessionId = sessionId;
  user.lastLogin = new Date().toISOString();
  upsertUser(user);

  const token = createSessionToken({
    id: user.id,
    email: user.email,
    workspaceId: user.workspaceId,
    role: user.role,
    sessionId,
  });

  const destination = user.role === "SYSTEM_ADMIN" ? "/admin" : user.termsAcceptedAt ? "/dashboard" : "/onboarding";
  const response = NextResponse.redirect(getAppRedirectUrl(destination, request.url));
  response.cookies.set("postflow_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
