import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";
import { saveIntegrationConfiguration } from "@/app/actions";
import { SOCIAL_PLATFORMS } from "@/lib/platforms";

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
        <p className="form-notice">Save each platform app credential once. This does not connect a social account: provider authorization must also be completed before status changes to Connected. Saved credentials are encrypted and cannot be replaced for this PostFlow ID.</p>
        <div className="platform-grid">
          {SOCIAL_PLATFORMS.map((platform) => {
            const account = connected.find((entry) => entry.platform === platform);
            const isConfigured = account?.configured || Boolean(account?.credentialsEncrypted);
            return (
              <div key={platform} className="platform-card">
                <div className="platform-header">
                  <span className="platform-logo">{platform[0]}</span>
                  <strong>{platform}</strong>
                </div>
                <p>{account?.connected ? "Connected" : isConfigured ? "Configured · authorization required" : "Not connected"}</p>
                {account?.connected ? (
                  <span className="integration-status">Connected</span>
                ) : isConfigured ? (
                  <span className="integration-status">Credentials saved</span>
                ) : (
                  <details className="integration-setup">
                    <summary className="primary-btn">Setup required</summary>
                    <form action={saveIntegrationConfiguration} className="form-stack">
                      <input type="hidden" name="platform" value={platform} />
                      <label>
                        <span>Client ID</span>
                        <input name="clientId" autoComplete="off" required maxLength={512} />
                      </label>
                      <label>
                        <span>Client Secret</span>
                        <input name="clientSecret" type="password" autoComplete="new-password" required maxLength={4096} />
                      </label>
                      <button type="submit" className="primary-btn">Save credentials</button>
                    </form>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
