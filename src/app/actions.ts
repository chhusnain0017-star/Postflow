"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { addAuditLog, createAccessRequest, createPost, ensureConfiguredAdmin, readStore, seedDemoData, upsertUser, writeStore } from "@/lib/store";
import { createSessionToken, decryptProviderCredentials, encryptOAuthTokens, hashPassword, verifyInviteCode, verifyPassword, verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { requireAdmin, requireCustomer, requirePostApprover, requireSignedInUser, requireTeamManager } from "@/lib/access";
import { getOAuthAppCredentials } from "@/lib/oauth";
import { isSocialPlatform } from "@/lib/platforms";
import { localDateTimeToUtc } from "@/lib/time-zone";
import { addOneYear } from "@/lib/billing";

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

  if (user.status === "EXPIRED") redirect("/waiting?status=expired");
  if (user.status !== "APPROVED") {
    throw new Error("Your access is not active. Please wait for approval.");
  }
  if (user.accessExpiryDate) {
    const expiry = new Date(user.accessExpiryDate).getTime();
    if (!Number.isFinite(expiry) || Date.now() >= expiry) {
      user.status = "EXPIRED";
      delete user.activeSessionId;
      upsertUser(user);
      redirect("/waiting?status=expired");
    }
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

export async function requestAccessAction(
  _previousState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  if (formData.get("legalTerms") !== "yes") {
    return { error: "Accept the Terms of Service and Privacy Policy before requesting access." };
  }

  if (!name || !username || !email || !password || !inviteCode) {
    return { error: "Name, username, email, password, and access code are required." };
  }

  if (name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username) || password.length < 12 || password.length > 128) {
    return { error: "Choose a 3-30 character username and a password with at least 12 characters." };
  }

  if (!process.env.ACCESS_REQUEST_CODE?.trim()) {
    return { error: "Access requests are not configured. Please contact the administrator." };
  }

  if (!verifyInviteCode(inviteCode)) {
    return { error: "That access code is incorrect. Please contact the administrator if you need the code." };
  }

  const store = readStore();
  const emailTaken = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())
    || store.accessRequests.some((request) => request.email.toLowerCase() === email.toLowerCase());
  const usernameTaken = store.users.some((user) => user.username?.toLowerCase() === username.toLowerCase())
    || store.accessRequests.some((request) => request.username?.toLowerCase() === username.toLowerCase());
  if (emailTaken || usernameTaken) {
    return { error: "That email or username is already registered or awaiting review." };
  }

  const request = createAccessRequest({
    name,
    username,
    email,
    passwordHash: hashPassword(password),
    inviteCodeVerified: true,
    legalTermsAcceptedAt: new Date().toISOString(),
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

  const activatedAt = new Date();
  const user = {
    id: `user-${Date.now()}`,
    name: request.name,
    username: request.username,
    email: request.email,
    passwordHash: request.passwordHash,
    legalTermsAcceptedAt: request.legalTermsAcceptedAt,
    role: "OWNER" as const,
    status: "APPROVED" as const,
    workspaceId: `workspace-${Date.now()}`,
    accessStartDate: activatedAt.toISOString(),
    accessExpiryDate: addOneYear(activatedAt).toISOString(),
    createdAt: activatedAt.toISOString(),
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
  const campaignName = String(formData.get("campaignName") ?? "").trim().slice(0, 120);
  const selectedValues = formData.getAll("platforms").map(String);
  const platforms = [...new Set(selectedValues)].filter(isSocialPlatform);
  const user = await requireCustomer();
  if (!title || title.length > 250 || !description || description.length > 10000) {
    throw new Error("Enter a title (up to 250 characters) and description (up to 10,000 characters).");
  }
  if (platforms.length === 0) throw new Error("Select at least one supported platform.");

  const assetIds = [...new Set(formData.getAll("assetIds").map(String))];
  const currentStore = readStore();
  const ownedAssetIds = new Set(currentStore.assets.filter((asset) => asset.workspaceId === user.workspaceId && !asset.archivedAt).map((asset) => asset.id));
  if (assetIds.some((assetId) => !ownedAssetIds.has(assetId))) throw new Error("A selected asset is missing or does not belong to this workspace.");

  const scheduleValue = String(formData.get("scheduledAt") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "UTC");
  const parsedScheduledAt = scheduleValue ? localDateTimeToUtc(scheduleValue, timeZone) : null;
  if (scheduleValue && (!parsedScheduledAt || Date.parse(parsedScheduledAt) <= Date.now())) {
    throw new Error("Choose a valid future schedule time.");
  }
  const scheduledAt = parsedScheduledAt ?? undefined;

  const needsApproval = user.role === "EDITOR" || user.role === "MEMBER";

  const post = createPost({
    workspaceId: user.workspaceId,
    createdById: user.id,
    title,
    description,
    hashtags,
    selectedPlatforms: platforms,
    assetIds,
    status: needsApproval ? "PENDING_APPROVAL" : scheduledAt ? "SCHEDULED" : "DRAFT",
    campaignName: campaignName || undefined,
    scheduledAt,
    scheduleTimeZone: scheduledAt ? timeZone : undefined,
    approvalStatus: needsApproval ? "PENDING" : "NOT_REQUIRED",
  });

  addAuditLog({
    workspaceId: user.workspaceId,
    userId: user.id,
    event: needsApproval ? "Post Submitted for Approval" : scheduledAt ? "Post Scheduled" : "Post Draft Created",
    details: `Post ${post.id} entered ${post.status} state for ${platforms.join(", ")}`,
  });

  redirect(needsApproval ? "/approvals" : scheduledAt ? "/calendar" : "/library");
}

export async function archiveAssetAction(formData: FormData) {
  const user = await requireCustomer();
  const assetId = String(formData.get("assetId") ?? "");
  const store = readStore();
  const asset = store.assets.find((entry) => entry.id === assetId && entry.workspaceId === user.workspaceId && !entry.archivedAt);
  if (!asset) throw new Error("Asset not found in this workspace.");
  asset.archivedAt = new Date().toISOString();
  writeStore(store);
  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Asset Archived", details: `${asset.originalName} was archived` });
  revalidatePath("/library");
  revalidatePath("/create-post");
  redirect("/library");
}

export async function approvePostAction(formData: FormData) {
  const user = await requirePostApprover();
  const postId = String(formData.get("postId") ?? "");
  const store = readStore();
  const post = store.posts.find((entry) => entry.id === postId && entry.workspaceId === user.workspaceId);
  if (!post || post.approvalStatus !== "PENDING") throw new Error("Pending post approval not found.");
  if (post.createdById === user.id) throw new Error("You cannot approve your own post.");

  post.approvalStatus = "APPROVED";
  post.approvedBy = user.id;
  post.status = post.scheduledAt ? "SCHEDULED" : "DRAFT";
  writeStore(store);
  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Post Approved", details: `${post.id} was approved` });
  revalidatePath("/approvals");
  revalidatePath("/calendar");
  redirect("/approvals");
}

export async function rejectPostAction(formData: FormData) {
  const user = await requirePostApprover();
  const postId = String(formData.get("postId") ?? "");
  const store = readStore();
  const post = store.posts.find((entry) => entry.id === postId && entry.workspaceId === user.workspaceId);
  if (!post || post.approvalStatus !== "PENDING") throw new Error("Pending post approval not found.");
  if (post.createdById === user.id) throw new Error("You cannot reject your own post.");

  post.approvalStatus = "REJECTED";
  post.status = "DRAFT";
  post.scheduledAt = undefined;
  writeStore(store);
  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Post Rejected", details: `${post.id} was returned to drafts` });
  revalidatePath("/approvals");
  redirect("/approvals");
}

export async function reschedulePostAction(formData: FormData) {
  const user = await requireCustomer();
  const postId = String(formData.get("postId") ?? "");
  const scheduleValue = String(formData.get("scheduledAt") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "UTC");
  const scheduledAt = localDateTimeToUtc(scheduleValue, timeZone);
  if (!scheduledAt || Date.parse(scheduledAt) <= Date.now()) throw new Error("Choose a valid future schedule time.");

  const store = readStore();
  const post = store.posts.find((entry) => entry.id === postId && entry.workspaceId === user.workspaceId);
  if (!post || !["SCHEDULED", "DRAFT"].includes(post.status)) throw new Error("This post cannot be scheduled.");
  if (post.createdById !== user.id && !["OWNER", "ADMIN"].includes(user.role)) throw new Error("You can only schedule your own posts.");

  const needsApproval = user.role === "EDITOR" || user.role === "MEMBER";
  post.scheduledAt = scheduledAt;
  post.scheduleTimeZone = timeZone;
  post.status = needsApproval ? "PENDING_APPROVAL" : "SCHEDULED";
  post.approvalStatus = needsApproval ? "PENDING" : post.approvalStatus === "APPROVED" ? "APPROVED" : "NOT_REQUIRED";
  writeStore(store);
  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Post Rescheduled", details: `${post.id} scheduled for ${scheduledAt}` });
  revalidatePath("/calendar");
  revalidatePath("/approvals");
  redirect("/calendar");
}

export async function cancelScheduledPostAction(formData: FormData) {
  const user = await requireCustomer();
  const postId = String(formData.get("postId") ?? "");
  const store = readStore();
  const post = store.posts.find((entry) => entry.id === postId && entry.workspaceId === user.workspaceId);
  if (!post || post.status !== "SCHEDULED") throw new Error("Scheduled post not found.");
  if (post.createdById !== user.id && !["OWNER", "ADMIN"].includes(user.role)) throw new Error("You can only cancel your own scheduled posts.");

  post.status = "CANCELLED";
  writeStore(store);
  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "Scheduled Post Cancelled", details: `${post.id} was removed from the queue` });
  revalidatePath("/calendar");
  redirect("/calendar");
}

const teamRoles = ["ADMIN", "EDITOR", "APPROVER", "MEMBER"] as const;

export async function createTeamInviteAction(
  _previousState: { error?: string; inviteUrl?: string } | null,
  formData: FormData,
): Promise<{ error?: string; inviteUrl?: string }> {
  const manager = await requireTeamManager();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "MEMBER");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !teamRoles.includes(role as (typeof teamRoles)[number])) {
    return { error: "Enter a valid email and team role." };
  }
  if (manager.role === "ADMIN" && role === "ADMIN") return { error: "Only the workspace owner can invite another admin." };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] ?? "https";
  const requestOrigin = host ? `${protocol}://${host}` : "";
  let origin = requestOrigin;
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    try {
      const configured = new URL(configuredUrl);
      const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(configured.hostname);
      if (!(process.env.NODE_ENV === "production" && isLocalhost)) origin = configured.origin;
    } catch {
      if (!origin) return { error: "APP_URL is invalid; correct it before creating team invites." };
    }
  }
  if (!origin) return { error: "Set APP_URL before creating team invites." };

  const store = readStore();
  if (store.users.some((user) => user.email.toLowerCase() === email)
    || store.teamInvites.some((invite) => invite.email === email && !invite.acceptedAt && Date.parse(invite.expiresAt) > Date.now())) {
    return { error: "That email already belongs to a user or has a pending invite." };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const createdAt = new Date();
  store.teamInvites.push({
    id: `invite-${randomUUID()}`,
    workspaceId: manager.workspaceId,
    email,
    role: role as (typeof teamRoles)[number],
    tokenHash,
    createdById: manager.id,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + 72 * 60 * 60 * 1000).toISOString(),
  });
  writeStore(store);

  addAuditLog({ workspaceId: manager.workspaceId, userId: manager.id, event: "Team Invite Created", details: `Invited ${email} as ${role}` });
  revalidatePath("/team");
  return { inviteUrl: `${origin}/team/accept?token=${encodeURIComponent(token)}` };
}

export async function acceptTeamInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (formData.get("legalTerms") !== "yes") throw new Error("Accept the Terms of Service and Privacy Policy before joining.");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username) || name.length < 2 || name.length > 100 || password.length < 12 || password.length > 128) {
    throw new Error("Enter your name, a 3-30 character username, and a password of at least 12 characters.");
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const store = readStore();
  const invite = store.teamInvites.find((entry) => entry.tokenHash === tokenHash);
  if (!invite || invite.acceptedAt || Date.parse(invite.expiresAt) <= Date.now()) throw new Error("This team invite is invalid or expired.");
  if (store.users.some((user) => user.email.toLowerCase() === invite.email || user.username?.toLowerCase() === username.toLowerCase())) {
    throw new Error("That email or username is already in use.");
  }

  const activatedAt = new Date();
  const now = activatedAt.toISOString();
  store.users.push({
    id: `user-${randomUUID()}`,
    name,
    username,
    email: invite.email,
    passwordHash: hashPassword(password),
    legalTermsAcceptedAt: new Date().toISOString(),
    role: invite.role,
    status: "APPROVED",
    workspaceId: invite.workspaceId,
    accessStartDate: now,
    accessExpiryDate: addOneYear(activatedAt).toISOString(),
    createdAt: now,
  });
  invite.acceptedAt = now;
  writeStore(store);
  addAuditLog({ workspaceId: invite.workspaceId, event: "Team Invite Accepted", details: `${name} joined as ${invite.role}` });
  redirect("/login");
}

export async function updateTeamMemberAction(formData: FormData) {
  const manager = await requireTeamManager();
  const memberId = String(formData.get("memberId") ?? "");
  const requestedRole = String(formData.get("role") ?? "");
  const store = readStore();
  const member = store.users.find((user) => user.id === memberId && user.workspaceId === manager.workspaceId);
  if (!member || member.id === manager.id || member.role === "OWNER" || member.role === "SYSTEM_ADMIN") throw new Error("Team member not found or cannot be changed.");
  if (!teamRoles.includes(requestedRole as (typeof teamRoles)[number])) throw new Error("Choose a valid team role.");
  if (manager.role === "ADMIN" && requestedRole === "ADMIN") throw new Error("Only the workspace owner can assign the admin role.");
  member.role = requestedRole as (typeof teamRoles)[number];
  writeStore(store);
  addAuditLog({ workspaceId: manager.workspaceId, userId: manager.id, event: "Team Role Updated", details: `${member.email} role changed to ${member.role}` });
  revalidatePath("/team");
  redirect("/team");
}

export async function suspendTeamMemberAction(formData: FormData) {
  const manager = await requireTeamManager();
  const memberId = String(formData.get("memberId") ?? "");
  const store = readStore();
  const member = store.users.find((user) => user.id === memberId && user.workspaceId === manager.workspaceId);
  if (!member || member.id === manager.id || member.role === "OWNER" || member.role === "SYSTEM_ADMIN") throw new Error("Team member not found or cannot be suspended.");
  if (member.status !== "APPROVED" && member.status !== "SUSPENDED") throw new Error("Only active or suspended team members can be changed.");
  member.status = member.status === "SUSPENDED" ? "APPROVED" : "SUSPENDED";
  delete member.activeSessionId;
  writeStore(store);
  addAuditLog({ workspaceId: manager.workspaceId, userId: manager.id, event: "Team Member Status Updated", details: `${member.email} status changed to ${member.status}` });
  revalidatePath("/team");
  redirect("/team");
}

export async function completeWhatsAppSignupAction(
  _previousState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await requireCustomer();
  const authorizationCode = String(formData.get("authorizationCode") ?? "");
  const businessAccountId = String(formData.get("businessAccountId") ?? "");
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  if (authorizationCode.length < 10 || !/^\d{5,25}$/.test(businessAccountId)
    || !/^\d{5,25}$/.test(phoneNumberId) || !/^\d{6}$/.test(pin)) {
    return { error: "WhatsApp did not return valid business assets, or the 6-digit registration PIN is missing." };
  }

  const store = readStore();
  const existingAccount = store.socialAccounts.find((entry) => entry.workspaceId === user.workspaceId && entry.platform === "WhatsApp");
  if (existingAccount?.connected) return { error: "WhatsApp is already connected. Contact the administrator to change the connected account." };
  const credentials = getOAuthAppCredentials("WhatsApp")
    ?? (existingAccount?.credentialsEncrypted ? decryptProviderCredentials(existingAccount.credentialsEncrypted) : null);
  if (!credentials) return { error: "WhatsApp app credentials are not configured by the platform administrator." };
  const account = existingAccount ?? {
    id: `social-${randomUUID()}`,
    workspaceId: user.workspaceId,
    platform: "WhatsApp",
    accountName: "WhatsApp Business",
    connected: false,
    configured: true,
  };

  let connectedAccountName: string;
  try {
    const graphVersion = process.env.META_GRAPH_API_VERSION ?? "v25.0";
    const exchangeUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
    exchangeUrl.searchParams.set("client_id", credentials.clientId);
    exchangeUrl.searchParams.set("client_secret", credentials.clientSecret);
    exchangeUrl.searchParams.set("code", authorizationCode);
    const exchangeResponse = await fetch(exchangeUrl, { signal: AbortSignal.timeout(20000) });
    const tokenPayload = await exchangeResponse.json() as { access_token?: string; expires_in?: number; error?: { message?: string } };
    if (!exchangeResponse.ok || !tokenPayload.access_token) throw new Error(tokenPayload.error?.message ?? "WhatsApp token exchange failed.");

    const phoneUrl = new URL(`https://graph.facebook.com/${graphVersion}/${businessAccountId}/phone_numbers`);
    phoneUrl.searchParams.set("fields", "id,display_phone_number,verified_name");
    const phoneResponse = await fetch(phoneUrl, { headers: { Authorization: `Bearer ${tokenPayload.access_token}` }, signal: AbortSignal.timeout(20000) });
    const phonePayload = await phoneResponse.json() as { data?: Array<{ id?: string; display_phone_number?: string; verified_name?: string }>; error?: { message?: string } };
    const phone = phonePayload.data?.find((entry) => entry.id === phoneNumberId);
    if (!phoneResponse.ok || !phone) throw new Error(phonePayload.error?.message ?? "WhatsApp phone number was not found in the selected business account.");

    const registerUrl = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/register`;
    const registerResponse = await fetch(registerUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPayload.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", pin }),
      signal: AbortSignal.timeout(20000),
    });
    const registerPayload = await registerResponse.json() as { success?: boolean; error?: { message?: string } };
    if (!registerResponse.ok || registerPayload.success !== true) throw new Error(registerPayload.error?.message ?? "WhatsApp phone registration failed.");

    const subscribeResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${businessAccountId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
      signal: AbortSignal.timeout(20000),
    });
    const subscribePayload = await subscribeResponse.json() as { success?: boolean; error?: { message?: string } };
    if (!subscribeResponse.ok || subscribePayload.success !== true) throw new Error(subscribePayload.error?.message ?? "WhatsApp webhook subscription failed.");

    account.connected = true;
    account.connectedAt = new Date().toISOString();
    account.providerUserId = businessAccountId;
    account.businessAccountId = businessAccountId;
    account.phoneNumberId = phoneNumberId;
    account.accountName = phone.display_phone_number ?? phone.verified_name ?? "WhatsApp Business";
    account.accessTokenEncrypted = encryptOAuthTokens({ accessToken: tokenPayload.access_token });
    account.tokenExpiresAt = typeof tokenPayload.expires_in === "number"
      ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
      : undefined;
    account.grantedScopes = ["whatsapp_business_management", "whatsapp_business_messaging"];
    if (!existingAccount) store.socialAccounts.push(account);
    writeStore(store);
    connectedAccountName = account.accountName;
  } catch {
    return { error: "WhatsApp setup did not finish. Verify the Meta app review, business permissions, phone PIN, webhook URL, and credentials, then retry." };
  }

  addAuditLog({ workspaceId: user.workspaceId, userId: user.id, event: "WhatsApp Business Connected", details: `Connected ${connectedAccountName}` });
  revalidatePath("/integrations");
  redirect("/integrations?connection=connected");
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

export async function renewCustomerContractAction(formData: FormData) {
  const administrator = await requireAdmin();
  const customerId = String(formData.get("customerId") ?? "");
  const store = readStore();
  const customer = store.users.find((entry) => entry.id === customerId && entry.role !== "SYSTEM_ADMIN");
  if (!customer) throw new Error("Customer account not found.");

  const expiry = customer.accessExpiryDate ? Date.parse(customer.accessExpiryDate) : NaN;
  if (customer.status !== "EXPIRED" && (!Number.isFinite(expiry) || expiry > Date.now())) {
    throw new Error("Only expired customer contracts can be renewed.");
  }

  const activatedAt = new Date();
  customer.accessStartDate = activatedAt.toISOString();
  customer.accessExpiryDate = addOneYear(activatedAt).toISOString();
  customer.status = "APPROVED";
  delete customer.activeSessionId;
  writeStore(store);
  addAuditLog({
    workspaceId: customer.workspaceId,
    userId: administrator.id,
    event: "Customer Contract Renewed",
    details: `${customer.email} renewed through ${customer.accessExpiryDate}`,
  });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function removeCustomerIntegrationCredentialsAction(formData: FormData) {
  const administrator = await requireAdmin();
  const accountId = String(formData.get("accountId") ?? "").trim();
  if (!accountId) throw new Error("Choose a customer integration to remove.");

  const store = readStore();
  const account = store.socialAccounts.find((entry) => entry.id === accountId);
  if (!account) throw new Error("Customer integration not found.");

  const customer = store.users.find((entry) => entry.workspaceId === account.workspaceId
    && entry.role !== "SYSTEM_ADMIN");
  if (!customer) throw new Error("Customer workspace not found.");

  store.socialAccounts = store.socialAccounts.filter((entry) => entry.id !== account.id);
  store.oauthStates = store.oauthStates.filter((entry) => entry.accountId !== account.id);
  writeStore(store);
  addAuditLog({
    workspaceId: account.workspaceId,
    userId: administrator.id,
    event: "Customer Integration Removed",
    details: `${account.platform} credentials and stored tokens removed for ${customer.email}`,
  });
  revalidatePath("/admin/customers");
  revalidatePath("/integrations");
  redirect("/admin/customers?integration=removed");
}
