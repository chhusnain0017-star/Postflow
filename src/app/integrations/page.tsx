import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

const platforms = ["Facebook", "Instagram", "YouTube", "TikTok", "X", "Pinterest", "Threads"];

export default async function IntegrationsPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  if (!session) redirect("/login");

  seedDemoData();
  const store = readStore();
  const user = store.users.find((entry) => entry.id === session.id) ?? null;
  if (!user || user.status !== "APPROVED") redirect("/waiting");

  const connected = store.socialAccounts.filter((account) => account.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">PostFlow</div>
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/create-post">Create Post</a>
          <a href="/integrations" className="active">Integrations</a>
          <a href="/history">History</a>
          <a href="/settings">Settings</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Social integrations</h1>
        <div className="platform-grid">
          {platforms.map((platform) => {
            const account = connected.find((entry) => entry.platform === platform);
            return (
              <div key={platform} className="platform-card">
                <div className="platform-header">
                  <span className="platform-logo">{platform[0]}</span>
                  <strong>{platform}</strong>
                </div>
                <p>{account?.connected ? "Connected" : "Not connected"}</p>
                <button type="button" className={account?.connected ? "secondary-btn" : "primary-btn"}>
                  {account?.connected ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
