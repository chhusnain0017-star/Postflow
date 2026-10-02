import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { hashPassword, verifySuperAdminCredentials } from "@/lib/auth";

export type UserRole = "SYSTEM_ADMIN" | "OWNER" | "ADMIN" | "EDITOR" | "APPROVER" | "MEMBER";
export type AccessStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "EXPIRED";

export type UserRecord = {
  id: string;
  name: string;
  username?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: AccessStatus;
  workspaceId: string;
  accessStartDate?: string;
  accessExpiryDate?: string;
  termsAcceptedAt?: string;
  integrationsLockedAt?: string;
  activeSessionId?: string;
  createdAt: string;
  lastLogin?: string;
};

export type AccessRequest = {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  inviteCodeVerified: boolean;
  status: AccessStatus;
  createdAt: string;
  reviewedAt?: string;
};

export type PostRecord = {
  id: string;
  workspaceId: string;
  createdById?: string;
  title: string;
  description: string;
  hashtags: string;
  selectedPlatforms: string[];
  status: "DRAFT" | "PENDING_APPROVAL" | "SCHEDULED" | "PUBLISHED" | "FAILED" | "CANCELLED";
  campaignName?: string;
  scheduledAt?: string;
  scheduleTimeZone?: string;
  approvalStatus?: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  assetIds?: string[];
  lastError?: string;
  publishedAt?: string;
  createdAt: string;
};

export type AssetRecord = {
  id: string;
  workspaceId: string;
  uploadedById: string;
  originalName: string;
  mimeType: string;
  size: number;
  tags: string[];
  storageKey: string;
  archivedAt?: string;
  createdAt: string;
};

export type MetricRecord = {
  id: string;
  workspaceId: string;
  postId: string;
  platform: string;
  campaignName?: string;
  capturedAt: string;
  impressions: number;
  reach: number;
  videoViews: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
};

export type TeamInviteRecord = {
  id: string;
  workspaceId: string;
  email: string;
  role: Exclude<UserRole, "SYSTEM_ADMIN" | "OWNER">;
  tokenHash: string;
  createdById: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
};

export type SocialAccount = {
  id: string;
  workspaceId: string;
  platform: string;
  accountName: string;
  connected: boolean;
  configured?: boolean;
  credentialsEncrypted?: string;
  accessTokenEncrypted?: string;
  refreshTokenEncrypted?: string;
  tokenExpiresAt?: string;
  connectedAt?: string;
  providerUserId?: string;
  grantedScopes?: string[];
  businessAccountId?: string;
  phoneNumberId?: string;
};

export type OAuthStateRecord = {
  id: string;
  stateHash: string;
  workspaceId: string;
  userId: string;
  accountId: string;
  platform: string;
  codeVerifierEncrypted?: string;
  createdAt: string;
  expiresAt: string;
};

export type AuditLog = {
  id: string;
  workspaceId?: string;
  userId?: string;
  event: string;
  details: string;
  createdAt: string;
};

export type AppData = {
  users: UserRecord[];
  accessRequests: AccessRequest[];
  posts: PostRecord[];
  socialAccounts: SocialAccount[];
  oauthStates: OAuthStateRecord[];
  assets: AssetRecord[];
  metrics: MetricRecord[];
  teamInvites: TeamInviteRecord[];
  logs: AuditLog[];
};

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const STORE_PATH = join(DATA_DIR, "app-data.json");
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.trim();
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

export function getAssetStorageDir() {
  return join(DATA_DIR, "assets");
}

function defaultData(): AppData {
  const now = new Date().toISOString();
  return {
    users: SUPER_ADMIN_EMAIL && SUPER_ADMIN_PASSWORD ? [
      {
        id: "admin-1",
        name: "System Admin",
        email: SUPER_ADMIN_EMAIL,
        passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
        role: "SYSTEM_ADMIN",
        status: "APPROVED",
        workspaceId: "workspace-admin",
        accessStartDate: now,
        accessExpiryDate: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
      },
    ] : [],
    accessRequests: [],
    posts: [],
    socialAccounts: [],
    oauthStates: [],
    assets: [],
    metrics: [],
    teamInvites: [],
    logs: [],
  };
}

export function readStore(): AppData {
  try {
    if (!existsSync(STORE_PATH)) {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(STORE_PATH, JSON.stringify(defaultData(), null, 2));
    }
    const file = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(file) as AppData;
    return {
      ...parsed,
      users: (parsed.users ?? []).map((user) => ({ ...user })),
      accessRequests: parsed.accessRequests ?? [],
      posts: parsed.posts ?? [],
      socialAccounts: parsed.socialAccounts ?? [],
      oauthStates: parsed.oauthStates ?? [],
      assets: parsed.assets ?? [],
      metrics: parsed.metrics ?? [],
      teamInvites: parsed.teamInvites ?? [],
      logs: parsed.logs ?? [],
    };
  } catch {
    return defaultData();
  }
}

export function writeStore(data: AppData) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function upsertUser(user: UserRecord) {
  const data = readStore();
  const index = data.users.findIndex((entry) => entry.id === user.id);
  if (index >= 0) {
    data.users[index] = user;
  } else {
    data.users.push(user);
  }
  writeStore(data);
  return user;
}

export function getUserByEmail(email: string) {
  return readStore().users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string) {
  return readStore().users.find((user) => user.id === id);
}

export function ensureConfiguredAdmin(email: string, password: string) {
  if (!verifySuperAdminCredentials(email, password)) {
    throw new Error("Admin credentials do not match the Railway Super Admin environment values.");
  }

  const store = readStore();
  const normalizedEmail = process.env.SUPER_ADMIN_EMAIL!.trim().toLowerCase();
  let user = store.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (user && user.role !== "SYSTEM_ADMIN") {
    throw new Error("The configured Super Admin email is already assigned to a customer account.");
  }

  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: `admin-${randomUUID()}`,
      name: "System Admin",
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "SYSTEM_ADMIN",
      status: "APPROVED",
      workspaceId: "workspace-admin",
      accessStartDate: now,
      accessExpiryDate: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    };
    store.users.push(user);
  } else {
    user.status = "APPROVED";
    user.passwordHash = hashPassword(password);
  }

  writeStore(store);
  return user;
}

export function createAccessRequest(data: Omit<AccessRequest, "id" | "createdAt">) {
  const store = readStore();
  const request: AccessRequest = {
    ...data,
    id: `req-${randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.accessRequests.push(request);
  writeStore(store);
  return request;
}

export function createPost(post: Omit<PostRecord, "id" | "createdAt">) {
  const store = readStore();
  const entry: PostRecord = {
    ...post,
    id: `post-${randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.posts.push(entry);
  writeStore(store);
  return entry;
}

export function addAuditLog(log: Omit<AuditLog, "id" | "createdAt">) {
  const store = readStore();
  const entry: AuditLog = {
    ...log,
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.logs.push(entry);
  writeStore(store);
  return entry;
}

export function getWorkspaceData(workspaceId: string) {
  const data = readStore();
  return {
    user: data.users.find((user) => user.workspaceId === workspaceId),
    posts: data.posts.filter((post) => post.workspaceId === workspaceId),
    socialAccounts: data.socialAccounts.filter((account) => account.workspaceId === workspaceId),
    logs: data.logs.filter((log) => log.workspaceId === workspaceId),
  };
}

export function seedDemoData() {
  return readStore();
}
