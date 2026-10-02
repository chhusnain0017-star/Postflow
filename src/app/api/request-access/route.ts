import { NextResponse } from "next/server";
import { addAuditLog, createAccessRequest, getUserByEmail, readStore } from "@/lib/store";
import { hashPassword, verifyInviteCode } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();

  if (!name || name.length > 100 || !username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !password || password.length < 12 || password.length > 128 || !inviteCode
    || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!verifyInviteCode(inviteCode)) {
    return NextResponse.json({ error: "Invalid access code or access requests are unavailable" }, { status: 403 });
  }

  const store = readStore();
  const duplicate = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase() || user.username?.toLowerCase() === username.toLowerCase())
    || store.accessRequests.some((entry) => entry.email.toLowerCase() === email.toLowerCase() || entry.username?.toLowerCase() === username.toLowerCase());
  if (duplicate || getUserByEmail(email)) {
    return NextResponse.json({ error: "That email or username is already registered or awaiting review" }, { status: 409 });
  }

  const requestRecord = createAccessRequest({
    name,
    username,
    email,
    passwordHash: hashPassword(password),
    inviteCodeVerified: true,
    status: "PENDING",
  });

  addAuditLog({
    event: "Access Request",
    details: `${name} submitted a customer access request`,
    userId: requestRecord.id,
  });

  return NextResponse.redirect(new URL("/waiting", process.env.APP_URL ?? "http://localhost:3000"));
}
