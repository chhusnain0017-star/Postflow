import { NextResponse } from "next/server";
import { addAuditLog, createAccessRequest } from "../../../../tests/store";

const validPlans = ["1-month", "6-months", "1-year"] as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const plan = String(formData.get("subscriptionPlan") ?? "");

  if (!name || name.length > 100 || !/^\+?[0-9\s().-]{7,24}$/.test(whatsappNumber)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !validPlans.includes(plan as (typeof validPlans)[number])) {
    return NextResponse.json({ error: "Enter your full name, valid WhatsApp number, email address, and subscription plan." }, { status: 400 });
  }

  const requestRecord = createAccessRequest({
    name,
    email,
    whatsappNumber,
    subscriptionPlan: plan as (typeof validPlans)[number],
    status: "PENDING",
  });
  addAuditLog({
    event: "Subscription Request",
    details: `${name} requested the ${plan} subscription`,
    userId: requestRecord.id,
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
