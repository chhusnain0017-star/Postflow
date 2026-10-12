import Image from "next/image";
import Link from "next/link";
import { requireCustomer } from "@/lib/access";
import { readStore } from "../../../tests/store";
import CustomerNav from "@/app/components/CustomerNav";
import DashboardComposer from "./DashboardComposer";

const platformDescriptions = {
  Instagram: "Plan visual stories and reels for your connected Instagram account.",
  YouTube: "Organize video drafts and prepare content for your connected YouTube channel.",
} as const;

export default async function DashboardPage() {
  const user = await requireCustomer();
  const store = readStore();
  const workspacePosts = store.posts.filter((post) => post.workspaceId === user.workspaceId);
  const connectedAccounts = store.socialAccounts.filter(
    (account) => account.workspaceId === user.workspaceId && account.connected,
  );
  const platformMetrics = store.metrics.filter((metric) => metric.workspaceId === user.workspaceId)
    .sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt))
    .slice(0, 4);
  const recentActivity = store.logs.filter((log) => log.workspaceId === user.workspaceId)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 6);
  const trialExpiry = user.accessExpiryDate
    ? new Date(user.accessExpiryDate).toLocaleDateString()
    : null;

  return (
    <main className="app-shell dashboard-shell">
      <CustomerNav active="dashboard" role={user.role} />
      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="dashboard-title">
            <span>Workspace</span>
            <h1>Dashboard</h1>
          </div>
          <label className="dashboard-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search posts, media, and channels" aria-label="Search posts, media, and channels" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="dashboard-top-actions">
            <Link href="/settings" aria-label="Settings" className="topbar-icon">⚙</Link>
            <Link href="/privacy" aria-label="Help" className="topbar-icon">?</Link>
            <details className="profile-menu">
              <summary>
                <Image src={user.avatarUrl || "/postflow-logo-green.png"} alt="" width={36} height={36} unoptimized />
                <span>{user.name}</span>
                <i aria-hidden="true">⌄</i>
              </summary>
              <div className="profile-menu-panel">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <Link href="/settings">Account settings</Link>
                <Link href="/upgrade">Upgrade plan</Link>
              </div>
            </details>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="dashboard-main-column">
            <section className="dashboard-welcome">
              <div>
                <p className="eyebrow">Your workspace at a glance</p>
                <h2>Welcome back, {user.name.split(" ")[0]}</h2>
                <p>Bring your videos and social channels together in one simple workflow.</p>
              </div>
              <Link href="/upgrade" className="secondary-btn">{trialExpiry ? `Trial ends · ${trialExpiry}` : "Upgrade"}</Link>
            </section>

            <div className="dashboard-stats">
              <article><span>Connected channels</span><strong>{connectedAccounts.length}</strong></article>
              <article><span>Posts in workspace</span><strong>{workspacePosts.length}</strong></article>
              <article><span>Trial ends</span><strong>{trialExpiry ?? "—"}</strong></article>
            </div>

            <DashboardComposer />

            <section className="dashboard-recent-posts">
              <div className="dashboard-section-heading">
                <h2>Recent posts</h2>
                <Link href="/history">View activity</Link>
              </div>
              {workspacePosts.length === 0 ? (
                <p className="dashboard-empty">Your posts will appear here after you create your first video draft.</p>
              ) : (
                <ul className="dashboard-post-list">
                  {workspacePosts.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4).map((post) => (
                    <li key={post.id}>
                      <span className="post-status-dot" aria-hidden="true" />
                      <div><strong>{post.title}</strong><span>{post.selectedPlatforms.join(" · ")}</span></div>
                      <small>{post.status.replaceAll("_", " ")}</small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="dashboard-right-column">
            <section className="dashboard-side-card">
              <div className="dashboard-section-heading"><h2>Social platforms</h2><Link href="/integrations">Manage</Link></div>
              {(["Instagram", "YouTube"] as const).map((platform) => {
                const account = connectedAccounts.find((entry) => entry.platform === platform);
                return (
                  <article className="social-summary-card" key={platform}>
                    <div className={`social-summary-icon ${platform.toLowerCase()}`} aria-hidden="true">{platform === "YouTube" ? "▶" : "◎"}</div>
                    <div>
                      <strong>{platform}</strong>
                      <p>{platformDescriptions[platform]}</p>
                      <span className={account ? "channel-connected" : "channel-disconnected"}>
                        {account ? `Connected · ${account.accountName}` : "Not connected"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="dashboard-side-card">
              <div className="dashboard-section-heading"><h2>Notifications</h2><span className="notification-count">{recentActivity.length}</span></div>
              {platformMetrics.map((metric) => (
                <article className="activity-item" key={metric.id}>
                  <span className="activity-avatar">{metric.platform[0]}</span>
                  <p><strong>{metric.platform}</strong> activity: {metric.likes} likes and {metric.comments} comments reported.</p>
                  <time dateTime={metric.capturedAt}>{new Date(metric.capturedAt).toLocaleDateString()}</time>
                </article>
              ))}
              {recentActivity.map((activity) => (
                <article className="activity-item" key={activity.id}>
                  <span className="activity-avatar">P</span>
                  <p><strong>{activity.event}</strong><br />{activity.details}</p>
                  <time dateTime={activity.createdAt}>{new Date(activity.createdAt).toLocaleDateString()}</time>
                </article>
              ))}
              {!platformMetrics.length && !recentActivity.length && (
                <p className="dashboard-empty">Likes, comments, and workspace activity will appear here when available.</p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
