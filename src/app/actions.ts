"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { addAuditLog, createAccessRequest, createPost, ensureConfiguredAdmin, readStore, seedDemoData, upsertUser, writeStore } from "@/lib/store";
import { createSessionToken, hashPassword, verifyInviteCode, verifyPassword, verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { requireAdmin, requireCustomer, requireSignedInUser } from "@/lib/access";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? formData.get("email") ?? formData.get("superAdminEmail") ?? "").trim();
  const password = String(formData.get("password") ?? formData.get("superAdminPassword") ?? "");
  const loginMode = String(formData.get("loginMode") ?? "customer");
  if (loginMode !== "admin" && loginMode !== "customer") throw new Error("Invalid login option.");
  let user;
  if (loginMode === "admin") {
    user = ensureConfiguredAdmin(
      String(formData.get("superAdminEmail") ?? identifier),
      String(formData.get("superAdminPassword") ?? password),
    );
  } else {
    user = readStore().users.find((entry) => entry.email.toLowerCase() === identifier.toLowerCase()
      || entry.username?.toLowerCase() === identifier.toLowerCase());
    if (!user || user.role === "SYSTEM_ADMIN" || !verifyPassword(password, user.passwordHash)) {
      throw new Error("Invalid username/email or password.");
    }
  }

  if (user.status !== "APPROVED") {
    throw new Error("Your access is not active. Please wait for approval.");
  }
  if (user.accessExpiryDate) {
    const expiry = new Date(user.accessExpiryDate).getTime();
    if (!Number.isFinite(expiry) || Date.now() > expiry) throw new Error("This account's access has expired.");
  }

  const sessionId = randomUUID();
  const token = createSessionToken({
    id: user.id,
    email: user.email,
    workspaceId: user.workspaceId,
    role: user.role,
    sessionId,
  });

  const cookieStore = await cookies();
  cookieStore.set("postflow_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  user.lastLogin = new Date().toISOString();
  user.activeSessionId = sessionId;
  upsertUser(user);
  addAuditLog({
    workspaceId: user.workspaceId,
    userId: user.id,
    event: "Login",
    details: `${user.name} logged in successfully`,
  });

  if (user.role === "SYSTEM_ADMIN") {
    redirect("/admin");
  }
  if (!user.termsAcceptedAt) redirect("/onboarding");
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  const user = session ? readStore().users.find((entry) => entry.id === session.id) : null;
  if (user && user.activeSessionId === session?.sessionId) {
    delete user.activeSessionId;
    upsertUser(user);
  }
  cookieStore.delete("postflow_session");
  redirect("/");
}

export async function acceptTermsAction(formData: FormData) {
  if (formData.get("acceptTerms") !== "yes") throw new Error("Accept the terms before continuing.");
  const user = await requireSignedInUser();
  if (user.role === "SYSTEM_ADMIN") throw new Error("Customer terms do not apply to administrator accounts.");

  if (!user.termsAcceptedAt) {
    user.termsAcceptedAt = new Date().toISOString();
    upsertUser(user);
    addAuditLog({
      workspaceId: user.workspaceId,
      userId: user.id,
      event: "Integration Terms Accepted",
      details: `${user.username ?? user.name} accepted the one-time integration terms`,
    });
  }
  redirect("/dashboard");
}

export async function requestAccessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();

  if (!name || !username || !email || !password || !inviteCode) {
    throw new Error("Name, username, email, password, and access code are required.");
  }

  if (name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username) || password.length < 12 || password.length > 128) {
    throw new Error("Choose a 3-30 character username and a password with at least 12 characters.");
  }

  if (!verifyInviteCode(inviteCode)) {
    throw new Error("That access code is invalid or access requests are not available.");
  }

  const store = readStore();
  const emailTaken = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())
    || store.accessRequests.some((request) => request.email.toLowerCase() === email.toLowerCase());
  const usernameTaken = store.users.some((user) => user.username?.toLowerCase() === username.toLowerCase())
    || store.accessRequests.some((request) => request.username?.toLowerCase() === username.toLowerCase());
  if (emailTaken || usernameTaken) {
    throw new Error("That email or username is already registered or awaiting review.");
  }

  const request = createAccessRequest({
    name,
    username,
    email,
    passwordHash: hashPassword(password),
    inviteCodeVerified: true,
    status: "PENDING",
  });

  addAuditLog({
    userId: request.id,
    event: "Access Request",
    details: `${name} submitted an access request`,
  });

  redirect("/waiting");
}

async function requireSystemAdmin() {
  return requireAdmin();
}

export async function approveAccessRequestAction(formData: FormData) {
  await requireSystemAdmin();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const store = readStore();
  const request = store.accessRequests.find((entry) => entry.id === requestId);

  if (!request) {
    throw new Error("Access request not found.");
  }
  if (!request.inviteCodeVerified) throw new Error("This request did not pass access-code verification.");

  const existing = store.users.find((entry) => entry.email.toLowerCase() === request.email.toLowerCase()
    || entry.username?.toLowerCase() === request.username?.toLowerCase());
  if (existing) {
    throw new Error("A customer with that email already exists.");
  }

  const user = {
    id: `user-${Date.now()}`,
    name: request.name,
    username: request.username,
    email: request.email,
    passwordHash: request.passwordHash,
    role: "OWNER" as const,
    status: "APPROVED" as const,
    workspaceId: `workspace-${Date.now()}`,
    accessStartDate: new Date().toISOString(),
    accessExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  store.accessRequests = store.accessRequests.filter((entry) => entry.id !== requestId);
  writeStore(store);
  addAuditLog({
    workspaceId: user.workspaceId,
    userId: user.id,
    event: "Access Approved",
    details: `${user.name} access was approved by admin`,
  });

  redirect("/admin/requests");
}

export async function rejectAccessRequestAction(formData: FormData) {
  await requireSystemAdmin();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const store = readStore();
  const request = store.accessRequests.find((entry) => entry.id === requestId);

  if (!request) {
    throw new Error("Access request not found.");
  }

  store.accessRequests = store.accessRequests.filter((entry) => entry.id !== requestId);
  writeStore(store);
  addAuditLog({
    userId: request.id,
    event: "Access Rejected",
    details: `${request.name} request was rejected by admin`,
  });

  redirect("/admin/requests");
}

export async function createCustomerPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const hashtags = String(formData.get("hashtags") ?? "").trim();
  const platforms = formData.getAll("platforms") as string[];
  const user = await requireCustomer();
  if (!title || !description) throw new Error("A title and description are required.");

  const post = createPost({
    workspaceId: user.workspaceId,
    title,
    description,
    hashtags,
    selectedPlatforms: platforms,
    status: "DRAFT",
  });

  addAuditLog({
    workspaceId: user.workspaceId,
    userId: user.id,
    event: "Post Draft Created",
    details: `Post ${post.id} saved as a draft for ${user.workspaceId}`,
  });

  redirect("/history");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  const user = session ? readStore().users.find((entry) => entry.id === session.id) : null;
  return user && user.activeSessionId === session?.sessionId ? user : null;
}

export async function ensureDemoSeed() {
  seedDemoData();
}
