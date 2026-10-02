import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { readStore, upsertUser } from "@/lib/store";
import { getAppRedirectUrl } from "@/lib/redirect-url";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  const user = session ? readStore().users.find((entry) => entry.id === session.id) : null;
  if (user && user.activeSessionId === session?.sessionId) {
    delete user.activeSessionId;
    upsertUser(user);
  }
  const response = NextResponse.redirect(getAppRedirectUrl("/", request.url));
  response.cookies.set("postflow_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
