import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { groupMetricRecords, latestMetricSnapshots } from "@/lib/analytics";
import { readStore } from "@/lib/store";

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const user = await requireCustomer();
  const url = new URL(request.url);
  const fromValue = url.searchParams.get("from") ?? "";
  const toValue = url.searchParams.get("to") ?? "";
  const campaign = url.searchParams.get("campaign") ?? "";
  const groupBy = url.searchParams.get("groupBy") === "campaign" ? "campaign" : "platform";
  const parsedFrom = /^\d{4}-\d{2}-\d{2}$/.test(fromValue) ? Date.parse(`${fromValue}T00:00:00.000Z`) : NaN;
  const parsedTo = /^\d{4}-\d{2}-\d{2}$/.test(toValue) ? Date.parse(`${toValue}T23:59:59.999Z`) : NaN;
  const from = Number.isFinite(parsedFrom) ? parsedFrom : undefined;
  const to = Number.isFinite(parsedTo) ? parsedTo : undefined;
  const metrics = readStore().metrics.filter((metric) => metric.workspaceId === user.workspaceId && (!campaign || metric.campaignName === campaign));
  const groups = groupMetricRecords(latestMetricSnapshots(metrics, from, to), groupBy);
  const header = [groupBy, "posts", "impressions", "reach", "videoViews", "likes", "comments", "shares", "saves", "engagementRate", "clicks"];
  const rows = groups.map((group) => [group.label, group.posts, group.impressions, group.reach, group.videoViews, group.likes, group.comments, group.shares, group.saves, group.impressions ? `${(((group.likes + group.comments + group.shares + group.saves) / group.impressions) * 100).toFixed(2)}%` : "0%", group.clicks]);
  const csv = [header, ...rows].map((row) => row.map((cell) => csvCell(cell)).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=postflow-report.csv",
      "Cache-Control": "private, no-store",
    },
  });
}
