import test from "node:test";
import assert from "node:assert/strict";

import { createAccessDecision, createTenantScope } from "../src/lib/security-core.ts";
import { createSessionToken, hashPassword, verifyInviteCode, verifyPassword, verifySessionToken, verifySuperAdminCredentials } from "../src/lib/auth.ts";

test("customer can access their own post and not another workspace post", () => {
  const customerA = createTenantScope({ id: "user-a", workspaceId: "workspace-a" });
  const customerB = createTenantScope({ id: "user-b", workspaceId: "workspace-b" });

  const allowed = createAccessDecision(customerA, "workspace-a", "post-a");
  const rejected = createAccessDecision(customerA, "workspace-b", "post-b");

  assert.equal(allowed.allowed, true);
  assert.equal(rejected.allowed, false);
  assert.equal(rejected.reason, "workspace-mismatch");
  assert.equal(customerA.workspaceId, "workspace-a");
  assert.equal(customerB.workspaceId, "workspace-b");
});

test("expired access is denied for dashboard access", () => {
  const expired = createAccessDecision(
    { id: "u1", workspaceId: "ws1", accessExpiryDate: "2024-01-01T00:00:00.000Z" },
    "ws1",
    "dashboard",
  );

  assert.equal(expired.allowed, false);
  assert.equal(expired.reason, "access-expired");
});

test("passwords are salted and verified without accepting a wrong password", () => {
  const firstHash = hashPassword("a-long-customer-password");
  const secondHash = hashPassword("a-long-customer-password");

  assert.notEqual(firstHash, secondHash);
  assert.equal(verifyPassword("a-long-customer-password", firstHash), true);
  assert.equal(verifyPassword("wrong-password", firstHash), false);
});

test("invite codes are checked against the server-only configured value", () => {
  const previousCode = process.env.ACCESS_REQUEST_CODE;
  process.env.ACCESS_REQUEST_CODE = "private-test-code";
  try {
    assert.equal(verifyInviteCode("private-test-code"), true);
    assert.equal(verifyInviteCode("incorrect-code"), false);
  } finally {
    if (previousCode === undefined) delete process.env.ACCESS_REQUEST_CODE;
    else process.env.ACCESS_REQUEST_CODE = previousCode;
  }
});

test("session tokens reject tampering and work only with the configured secret", () => {
  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "a-long-test-session-secret";
  try {
    const token = createSessionToken({ id: "user-1", sessionId: "session-1" });
    assert.equal(verifySessionToken(token)?.id, "user-1");
    assert.equal(verifySessionToken(`${token}x`), null);
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }
});

test("admin sign-in only accepts the configured Super Admin values", () => {
  const previousEmail = process.env.SUPER_ADMIN_EMAIL;
  const previousPassword = process.env.SUPER_ADMIN_PASSWORD;
  process.env.SUPER_ADMIN_EMAIL = "owner@example.com";
  process.env.SUPER_ADMIN_PASSWORD = "private-admin-password";
  try {
    assert.equal(verifySuperAdminCredentials("OWNER@example.com", "private-admin-password"), true);
    assert.equal(verifySuperAdminCredentials("admin@postflow.local", "admin123"), false);
    assert.equal(verifySuperAdminCredentials("owner@example.com", "wrong-password"), false);
  } finally {
    if (previousEmail === undefined) delete process.env.SUPER_ADMIN_EMAIL;
    else process.env.SUPER_ADMIN_EMAIL = previousEmail;
    if (previousPassword === undefined) delete process.env.SUPER_ADMIN_PASSWORD;
    else process.env.SUPER_ADMIN_PASSWORD = previousPassword;
  }
});
