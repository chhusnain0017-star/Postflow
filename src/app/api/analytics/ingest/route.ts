import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { isSocialPlatform } from "@/lib/platforms";

export const runtime = "nodejs";

const metricKeys = ["impressions", "reach", "videoViews", "likes", "comments", "shares", "saves", "clicks"] as const;

function hasIngestSecret(authorization: string | null) {
  const configured = process.env.ANALYTICS_INGEST_SECRET;
  if (!configured || !authorization?.startsWith("Bearer ")) return false;
  const suppliedHash = createHash("sha256").update(authorization.slice(7)).digest();
  const configuredHash = createHash("sha256").update(configured).digest();
  return timingSafeEqual(suppliedHash, configuredHash);
}

export async function POST(request: Request) {
  if (!hasIngestSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized metrics source" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Expected a JSON metrics snapshot" }, { status: 400 });
  }

  const workspaceId = typeof payload.workspaceId === "string" ? payload.workspaceId : "";
  const postId = typeof payload.postId === "string" ? payload.postId : "";
  const platform = typeof payload.platform === "string" ? payload.platform : "";
  const capturedAt = typeof payload.capturedAt === "string" ? payload.capturedAt : new Date().toISOString();
  const capturedAtMs = Date.parse(capturedAt);
  const metrics = Object.fromEntries(metricKeys.map((key) => [key, payload[key]])) as Record<(typeof metricKeys)[number], unknown>;

  if (!workspaceId || !postId || !isSocialPlatform(platform) || !Number.isFinite(capturedAtMs)
    || capturedAtMs > Date.now() + 5 * 60 * 1000
    || metricKeys.some((key) => !Number.isSafeInteger(metrics[key]) || Number(metrics[key]) < 0 || Number(metrics[key]) > 1_000_000_000_000)) {
    return NextResponse.json({ error: "Invalid metrics snapshot" }, { status: 400 });
  }

  const store = readStore();
  const post = store.posts.find((entry) => entry.id === postId && entry.workspaceId === workspaceId && entry.status === "PUBLISHED");
  const connected = store.socialAccounts.some((account) => account.workspaceId === workspaceId && account.platform === platform && account.connected);
  if (!post || !post.selectedPlatforms.includes(platform) || !connected) {
    return NextResponse.json({ error: "Metrics must reference a published post and connected platform in this workspace" }, { status: 404 });
  }

  store.metrics.push({
    id: `metric-${randomUUID()}`,
    workspaceId,
    postId,
    platform,
    campaignName: post.campaignName,
    capturedAt: new Date(capturedAtMs).toISOString(),
    impressions: Number(metrics.impressions),
    reach: Number(metrics.reach),
    videoViews: Number(metrics.videoViews),
    likes: Number(metrics.likes),
    comments: Number(metrics.comments),
    shares: Number(metrics.shares),
    saves: Number(metrics.saves),
    clicks: Number(metrics.clicks),
  });
  writeStore(store);
  return NextResponse.json({ accepted: true }, { status: 201 });
}
