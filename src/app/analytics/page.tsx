import { requireCustomer } from "@/lib/access";
import CustomerNav from "@/app/components/CustomerNav";
import { groupMetricRecords, latestMetricSnapshots, sumMetricRecords } from "@/lib/analytics";
import { readStore } from "@/lib/store";

function parseDateStart(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function parseDateEnd(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const timestamp = Date.parse(`${value}T23:59:59.999Z`);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; campaign?: string; groupBy?: string }> }) {
  const user = await requireCustomer();
  const params = await searchParams;
  const store = readStore();
  const from = parseDateStart(params.from);
  const to = parseDateEnd(params.to);
  const selectedCampaign = params.campaign ?? "";
  const groupBy = params.groupBy === "campaign" ? "campaign" : "platform";
  const campaignNames = [...new Set([
    ...store.posts.filter((post) => post.workspaceId === user.workspaceId).map((post) => post.campaignName),
    ...store.metrics.filter((metric) => metric.workspaceId === user.workspaceId).map((metric) => metric.campaignName),
  ].filter((name): name is string => Boolean(name)))].sort();
  const ownedMetrics = store.metrics.filter((metric) => metric.workspaceId === user.workspaceId
    && (!selectedCampaign || metric.campaignName === selectedCampaign));
  const snapshots = latestMetricSnapshots(ownedMetrics, from, to);
  const totals = sumMetricRecords(snapshots);
  const groups = groupMetricRecords(snapshots, groupBy);
  const maxImpressions = Math.max(1, ...groups.map((group) => group.impressions));
  const engagements = totals.likes + totals.comments + totals.shares + totals.saves;
  const engagementRate = totals.impressions ? (engagements / totals.impressions) * 100 : 0;

  return (
    <main className="app-shell">
      <CustomerNav active="analytics" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Measured results</p>
        <div className="page-heading-row"><h1>Analytics</h1><a className="secondary-btn" href={`/api/analytics/export?${new URLSearchParams({ from: params.from ?? "", to: params.to ?? "", campaign: selectedCampaign, groupBy })}`}>Download CSV</a></div>
        <p className="form-notice">Reports use the latest verified provider snapshots for each post and platform. No sample or estimated metrics are included.</p>
        <form method="GET" className="analytics-filters">
          <label><span>From</span><input type="date" name="from" defaultValue={params.from} /></label>
          <label><span>To</span><input type="date" name="to" defaultValue={params.to} /></label>
          <label><span>Campaign</span><select name="campaign" defaultValue={selectedCampaign}><option value="">All campaigns</option>{campaignNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
          <label><span>Group by</span><select name="groupBy" defaultValue={groupBy}><option value="platform">Platform</option><option value="campaign">Campaign</option></select></label>
          <button type="submit" className="primary-btn">Apply report</button>
        </form>

        <div className="stats-grid analytics-stats">
          <div className="stat-card"><span>Impressions</span><strong>{number(totals.impressions)}</strong></div>
          <div className="stat-card"><span>Reach</span><strong>{number(totals.reach)}</strong></div>
          <div className="stat-card"><span>Video views</span><strong>{number(totals.videoViews)}</strong></div>
          <div className="stat-card"><span>Engagement rate</span><strong>{engagementRate.toFixed(2)}%</strong></div>
          <div className="stat-card"><span>Likes</span><strong>{number(totals.likes)}</strong></div>
          <div className="stat-card"><span>Comments</span><strong>{number(totals.comments)}</strong></div>
          <div className="stat-card"><span>Shares</span><strong>{number(totals.shares)}</strong></div>
          <div className="stat-card"><span>Saves</span><strong>{number(totals.saves)}</strong></div>
          <div className="stat-card"><span>Clicks</span><strong>{number(totals.clicks)}</strong></div>
        </div>

        {snapshots.length === 0 ? (
          <p className="empty-state analytics-empty">No provider metrics have been recorded for this report. Connect and publish through an authorized platform before expecting campaign results.</p>
        ) : (
          <>
            <section className="workspace-section">
              <div className="section-heading"><h2>{groupBy === "platform" ? "Platform performance" : "Campaign performance"}</h2><span>{snapshots.length} post-platform snapshots</span></div>
              <div className="analytics-table-wrap"><table className="analytics-table">
                <thead><tr><th>{groupBy === "platform" ? "Platform" : "Campaign"}</th><th>Posts</th><th>Impressions</th><th>Reach</th><th>Likes</th><th>Comments</th><th>Shares</th><th>Saves</th><th>Engagement rate</th><th>Clicks</th></tr></thead>
                <tbody>{groups.map((group) => <tr key={group.label}>
                  <th scope="row"><span>{group.label}</span><span className="metric-bar"><i style={{ width: `${Math.max(2, (group.impressions / maxImpressions) * 100)}%` }} /></span></th>
                  <td>{number(group.posts)}</td><td>{number(group.impressions)}</td><td>{number(group.reach)}</td>
                  <td>{number(group.likes)}</td><td>{number(group.comments)}</td><td>{number(group.shares)}</td><td>{number(group.saves)}</td>
                  <td>{group.impressions ? `${(((group.likes + group.comments + group.shares + group.saves) / group.impressions) * 100).toFixed(2)}%` : "—"}</td><td>{number(group.clicks)}</td>
                </tr>)}</tbody>
              </table></div>
            </section>
            <section className="workspace-section">
              <div className="section-heading"><h2>Post snapshots</h2></div>
              <ul className="list-block">{snapshots.map((snapshot) => {
                const post = store.posts.find((entry) => entry.id === snapshot.postId && entry.workspaceId === user.workspaceId);
                return <li key={snapshot.id}><strong>{post?.title ?? "Published post"}</strong><span>{snapshot.platform}</span><span>{number(snapshot.impressions)} impressions</span><span>{number(snapshot.likes + snapshot.comments + snapshot.shares + snapshot.saves)} engagements</span><span>{new Date(snapshot.capturedAt).toLocaleDateString()}</span></li>;
              })}</ul>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
