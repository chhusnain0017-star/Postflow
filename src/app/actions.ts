"use server";

import { redirect } from "next/navigation";
import { addAuditLog, createAccessRequest, createPost, getUserByEmail, readStore, seedDemoData, upsertUser, writeStore } from "@/lib/store";
import { createSessionToken, hashPassword, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const store = readStore();
  const user = store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  if (user.status !== "APPROVED") {
    throw new Error("Your access is not active. Please wait for approval.");
  }

  const token = createSessionToken({
    id: user.id,
    email: user.email,
    workspaceId: user.workspaceId,
    role: user.role,
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
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("postflow_session");
  redirect("/");
}

export async function requestAccessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const paymentReference = String(formData.get("paymentReference") ?? "").trim();

  if (!name || !email || !password || !paymentReference) {
    throw new Error("Name, email, password, and payment reference are required.");
  }

  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const request = createAccessRequest({
    name,
    email,
    passwordHash: hashPassword(password),
    paymentReference,
    paymentProof: "manual-proof-provided",
    status: "PENDING",
  });

  addAuditLog({
    userId: request.id,
    event: "Access Request",
    details: `${name} submitted an access request`,
  });

  redirect("/waiting");
}

export async function approveAccessRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "").trim();
  const store = readStore();
  const request = store.accessRequests.find((entry) => entry.id === requestId);

  if (!request) {
    throw new Error("Access request not found.");
  }

  const existing = store.users.find((entry) => entry.email.toLowerCase() === request.email.toLowerCase());
  if (existing) {
    throw new Error("A customer with that email already exists.");
  }

  const user = {
    id: `user-${Date.now()}`,
    name: request.name,
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
  const session = (await cookies()).get("postflow_session")?.value;
  const payload = session ? JSON.parse(Buffer.from(session.split(".")[0], "base64url").toString("utf8")) : null;

  if (!payload) {
    throw new Error("You must be logged in to publish.");
  }

  const post = createPost({
    workspaceId: payload.workspaceId,
    title,
    description,
    hashtags,
    selectedPlatforms: platforms,
    status: "PUBLISHED",
  });

  addAuditLog({
    workspaceId: payload.workspaceId,
    userId: payload.id,
    event: "Post Created",
    details: `Post ${post.id} created for ${payload.workspaceId}`,
  });

  redirect("/history");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("postflow_session")?.value;
  if (!token) return null;

  const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString("utf8"));
  const user = readStore().users.find((entry) => entry.id === payload.id);
  return user ?? null;
}

export async function ensureDemoSeed() {
  seedDemoData();
}
