import test from "node:test";
import assert from "node:assert/strict";

import { createAccessDecision, createTenantScope } from "../src/lib/security-core.ts";

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
