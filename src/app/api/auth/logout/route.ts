import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { readStore, upsertUser } from "@/lib/store";

export async function POST() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  const user = session ? readStore().users.find((entry) => entry.id === session.id) : null;
  if (user && user.activeSessionId === session?.sessionId) {
    delete user.activeSessionId;
    upsertUser(user);
  }
  const response = NextResponse.redirect(new URL("/", process.env.APP_URL ?? "http://localhost:3000"));
  response.cookies.set("postflow_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
