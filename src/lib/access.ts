import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isConfiguredSuperAdminIdentity, verifySessionToken } from "@/lib/auth";
import { readStore, type UserRecord } from "@/lib/store";

export async function requireSignedInUser() {
  const token = (await cookies()).get("postflow_session")?.value;
  const session = verifySessionToken(token);
  if (!session || typeof session.id !== "string" || typeof session.sessionId !== "string") {
    redirect("/login");
  }

  const user = readStore().users.find((entry) => entry.id === session.id);
  if (!user || user.activeSessionId !== session.sessionId) redirect("/login");
  if (user.status !== "APPROVED") redirect("/waiting");
  if (user.accessExpiryDate) {
    const expiry = new Date(user.accessExpiryDate).getTime();
    if (!Number.isFinite(expiry) || Date.now() > expiry) redirect("/waiting");
  }
  return user;
}

export async function requireCustomer(options: { requireTerms?: boolean } = {}): Promise<UserRecord> {
  const user = await requireSignedInUser();
  if (user.role === "SYSTEM_ADMIN") redirect("/admin");
  if (options.requireTerms !== false && !user.termsAcceptedAt) redirect("/onboarding");
  return user;
}

export async function requireAdmin(): Promise<UserRecord> {
  const user = await requireSignedInUser();
  if (!isConfiguredSuperAdminIdentity(user.email, user.role)) redirect("/dashboard");
  return user;
}
