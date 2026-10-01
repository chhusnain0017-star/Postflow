export type Role = "SYSTEM_ADMIN" | "OWNER" | "MEMBER";
export type AccessStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "EXPIRED";

export type TenantSession = {
  id: string;
  email?: string;
  workspaceId?: string;
  role?: Role;
  status?: AccessStatus;
  accessExpiryDate?: string;
};

export function createTenantScope(user: Partial<TenantSession> & { id: string; workspaceId?: string }) {
  return {
    id: user.id,
    workspaceId: user.workspaceId ?? "workspace-default",
    role: user.role ?? "OWNER",
    status: user.status ?? "APPROVED",
    accessExpiryDate: user.accessExpiryDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function createAccessDecision(
  user: Partial<TenantSession> | undefined,
  workspaceId: string,
  resourceId?: string,
) {
  if (!user) {
    return { allowed: false, reason: "not-authenticated" };
  }

  if (user.status && ["PENDING", "REJECTED", "SUSPENDED"].includes(user.status)) {
    return { allowed: false, reason: "account-status" };
  }

  if (user.workspaceId && user.workspaceId !== workspaceId) {
    return { allowed: false, reason: "workspace-mismatch" };
  }

  if (user.accessExpiryDate) {
    const expiry = new Date(user.accessExpiryDate).getTime();
    if (Number.isFinite(expiry) && Date.now() > expiry) {
      return { allowed: false, reason: "access-expired" };
    }
  }

  if (resourceId && typeof resourceId === "string" && resourceId.startsWith("customer-")) {
    return { allowed: false, reason: "resource-not-allowed" };
  }

  return { allowed: true, reason: "ok" };
}
