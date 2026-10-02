import type { MetricRecord } from "@/lib/store";

export type MetricGroupBy = "platform" | "campaign";
export type MetricTotals = Pick<MetricRecord, "impressions" | "reach" | "videoViews" | "likes" | "comments" | "shares" | "saves" | "clicks">;
export type MetricGroup = MetricTotals & { label: string; posts: number };

export function latestMetricSnapshots(records: MetricRecord[], from?: number, to?: number) {
  const latest = new Map<string, MetricRecord>();
  for (const record of records) {
    const capturedAt = Date.parse(record.capturedAt);
    if (!Number.isFinite(capturedAt) || (from !== undefined && capturedAt < from) || (to !== undefined && capturedAt > to)) continue;
    const key = `${record.postId}\u0000${record.platform}`;
    const current = latest.get(key);
    if (!current || capturedAt > Date.parse(current.capturedAt)) latest.set(key, record);
  }
  return [...latest.values()];
}

export function sumMetricRecords(records: MetricRecord[]): MetricTotals {
  return records.reduce<MetricTotals>((total, record) => ({
    impressions: total.impressions + record.impressions,
    reach: total.reach + record.reach,
    videoViews: total.videoViews + record.videoViews,
    likes: total.likes + record.likes,
    comments: total.comments + record.comments,
    shares: total.shares + record.shares,
    saves: total.saves + record.saves,
    clicks: total.clicks + record.clicks,
  }), { impressions: 0, reach: 0, videoViews: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 });
}

export function groupMetricRecords(records: MetricRecord[], groupBy: MetricGroupBy): MetricGroup[] {
  const groups = new Map<string, MetricRecord[]>();
  for (const record of records) {
    const label = groupBy === "platform" ? record.platform : record.campaignName?.trim() || "Unassigned campaign";
    groups.set(label, [...(groups.get(label) ?? []), record]);
  }
  return [...groups.entries()].map(([label, rows]) => ({ label, posts: new Set(rows.map((row) => row.postId)).size, ...sumMetricRecords(rows) }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
