import { NextResponse } from "next/server";
import { addAuditLog, createAccessRequest, readStore } from "@/lib/store";
import { hashPassword, verifyInviteCode } from "@/lib/auth";
import { getAppRedirectUrl } from "@/lib/redirect-url";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  const legalTerms = formData.get("legalTerms") === "yes";

  if (!name || name.length > 100 || !username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !password || password.length < 12 || password.length > 128 || !inviteCode || !legalTerms
    || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!verifyInviteCode(inviteCode)) {
    return NextResponse.json({ error: "Invalid access code or access requests are unavailable" }, { status: 403 });
  }

  const store = readStore();
  const duplicate = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase() || user.username?.toLowerCase() === username.toLowerCase())
    || store.accessRequests.some((entry) => entry.email.toLowerCase() === email.toLowerCase() || entry.username?.toLowerCase() === username.toLowerCase());
  if (duplicate) {
    return NextResponse.json({ error: "That email or username is already registered or awaiting review" }, { status: 409 });
  }

  const requestRecord = createAccessRequest({
    name,
    username,
    email,
    passwordHash: hashPassword(password),
    inviteCodeVerified: true,
    legalTermsAcceptedAt: new Date().toISOString(),
    status: "PENDING",
  });

  addAuditLog({
    event: "Access Request",
    details: `${name} submitted a customer access request`,
    userId: requestRecord.id,
  });

  return NextResponse.redirect(getAppRedirectUrl("/waiting", request.url));
}
