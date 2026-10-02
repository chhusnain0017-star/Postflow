import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hashPassword } from "@/lib/auth";

export type UserRole = "SYSTEM_ADMIN" | "OWNER" | "MEMBER";
export type AccessStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "EXPIRED";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: AccessStatus;
  workspaceId: string;
  accessStartDate?: string;
  accessExpiryDate?: string;
  createdAt: string;
  lastLogin?: string;
};

export type AccessRequest = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  paymentReference: string;
  paymentProof?: string;
  status: AccessStatus;
  createdAt: string;
  reviewedAt?: string;
};

export type PostRecord = {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  hashtags: string;
  selectedPlatforms: string[];
  status: "DRAFT" | "PUBLISHED" | "FAILED";
  createdAt: string;
};

export type SocialAccount = {
  id: string;
  workspaceId: string;
  platform: string;
  accountName: string;
  connected: boolean;
  providerUserId?: string;
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
  logs: AuditLog[];
};

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const STORE_PATH = join(DATA_DIR, "app-data.json");
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "admin@postflow.local";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "admin123";

function defaultData(): AppData {
  const now = new Date().toISOString();
  return {
    users: [
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
    ],
    accessRequests: [],
    posts: [],
    socialAccounts: [],
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
    const normalized = {
      ...parsed,
      users: (parsed.users ?? []).map((user) => {
        const email = user.email.toLowerCase();
        if (email === SUPER_ADMIN_EMAIL.toLowerCase() && !user.passwordHash.includes(":")) {
          return { ...user, passwordHash: hashPassword(SUPER_ADMIN_PASSWORD) };
        }
        if (email === "customer@postflow.local" && !user.passwordHash.includes(":")) {
          return { ...user, passwordHash: hashPassword("customer123") };
        }
        return user;
      }),
    };

    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      writeStore(normalized);
    }

    return normalized;
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

export function createAccessRequest(data: Omit<AccessRequest, "id" | "createdAt">) {
  const store = readStore();
  const request: AccessRequest = {
    ...data,
    id: `req-${Date.now()}`,
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
    id: `post-${Date.now()}`,
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
  const store = readStore();
  if (store.users.length === 0) {
    const now = new Date().toISOString();
    store.users.push({
      id: "admin-1",
      name: "System Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
      role: "SYSTEM_ADMIN",
      status: "APPROVED",
      workspaceId: "workspace-admin",
      accessStartDate: now,
      accessExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    });

    store.users.push({
      id: "customer-1",
      name: "Demo Customer",
      email: "customer@postflow.local",
      passwordHash: hashPassword("customer123"),
      role: "OWNER",
      status: "APPROVED",
      workspaceId: "workspace-1",
      accessStartDate: now,
      accessExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    });

    store.socialAccounts.push(
      { id: "sa-1", workspaceId: "workspace-1", platform: "Facebook", accountName: "Demo Page", connected: true },
      { id: "sa-2", workspaceId: "workspace-1", platform: "YouTube", accountName: "Demo Channel", connected: true },
      { id: "sa-3", workspaceId: "workspace-1", platform: "X", accountName: "Demo X", connected: false },
    );

    store.posts.push({
      id: "post-1",
      workspaceId: "workspace-1",
      title: "Campaign launch teaser",
      description: "Product launch social campaign",
      hashtags: "#launch #growth",
      selectedPlatforms: ["Facebook", "YouTube", "X"],
      status: "PUBLISHED",
      createdAt: now,
    });

    store.logs.push({
      id: "log-1",
      workspaceId: "workspace-1",
      userId: "customer-1",
      event: "Login",
      details: "Customer logged in successfully",
      createdAt: now,
    });
  }
  writeStore(store);
  return store;
}
