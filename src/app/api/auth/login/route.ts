import { NextResponse } from "next/server";
import { createSessionToken, verifyPassword } from "@/lib/auth";
import { readStore } from "@/lib/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = readStore().users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.status !== "APPROVED") {
    return NextResponse.json({ error: "Account not active" }, { status: 403 });
  }

  const token = createSessionToken({
    id: user.id,
    email: user.email,
    workspaceId: user.workspaceId,
    role: user.role,
  });

  const response = NextResponse.redirect(new URL(user.role === "SYSTEM_ADMIN" ? "/admin" : "/dashboard", process.env.APP_URL ?? "http://localhost:3000"));
  response.cookies.set("postflow_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
