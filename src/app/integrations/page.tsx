import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";
import { SOCIAL_PLATFORMS } from "@/lib/platforms";
import CustomerNav from "@/app/components/CustomerNav";
import IntegrationSetupModal from "@/app/integrations/IntegrationSetupModal";

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ connection?: string }> }) {
  const user = await requireCustomer();
  const { connection } = await searchParams;
  const store = readStore();

  const connected = store.socialAccounts.filter((account) => account.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <CustomerNav active="integrations" role={user.role} />
      <section className="content-panel">
        <h1>Social integrations</h1>
        <p className="form-notice">Save each platform app credential once. This does not connect a social account: provider authorization must also be completed before status changes to Connected. Saved credentials are encrypted and cannot be replaced for this PostFlow ID.</p>
        {connection === "connected" && <p className="integration-feedback success" role="status">Account authorization completed successfully.</p>}
        {connection === "failed" && <p className="integration-feedback error" role="alert">Authorization could not be verified. Check the app settings, callback URL, and requested permissions, then try again.</p>}
        {connection === "denied" && <p className="integration-feedback" role="status">Authorization was cancelled. Your account remains disconnected.</p>}
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
                  platform === "WhatsApp" ? (
                    <a href="/integrations/whatsapp" className="primary-btn">Connect WhatsApp Business</a>
                  ) : (
                    <a href={`/api/integrations/${encodeURIComponent(platform.toLowerCase())}/authorize`} className="primary-btn">Authorize / Connect Account</a>
                  )
                ) : (
                  <IntegrationSetupModal platform={platform} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
