import { NextResponse } from "next/server";
import { addAuditLog, createAccessRequest, getUserByEmail } from "@/lib/store";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const paymentReference = String(formData.get("paymentReference") ?? "").trim();

  if (!name || !email || !password || !paymentReference) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "That email is already registered" }, { status: 409 });
  }

  const requestRecord = createAccessRequest({
    name,
    email,
    passwordHash: hashPassword(password),
    paymentReference,
    paymentProof: "manual-proof-provided",
    status: "PENDING",
  });

  addAuditLog({
    event: "Access Request",
    details: `${name} submitted a customer access request`,
    userId: requestRecord.id,
  });

  return NextResponse.redirect(new URL("/waiting", process.env.APP_URL ?? "http://localhost:3000"));
}
