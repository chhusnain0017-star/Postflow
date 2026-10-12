import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Password login is no longer available. Continue with Google instead." },
    { status: 410 },
  );
}
