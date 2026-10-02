import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";

const platforms = ["Facebook", "Instagram", "YouTube", "TikTok", "X", "Pinterest", "Threads"];

export default async function IntegrationsPage() {
  const user = await requireCustomer();
  const store = readStore();

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
        <p className="form-notice">Provider sign-in is not configured yet. Connect actions stay disabled until the official OAuth credentials and secure return routes are installed. Once connected, accounts must remain fixed to this PostFlow ID.</p>
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
                <button type="button" className={account?.connected ? "secondary-btn" : "primary-btn"} disabled={!account?.connected}>
                  {account?.connected ? "Connected" : "Setup required"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
