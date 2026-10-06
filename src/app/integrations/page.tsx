import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";
import { SOCIAL_PLATFORMS } from "@/lib/platforms";
import { getOAuthAppCredentials } from "@/lib/oauth";
import CustomerNav from "@/app/components/CustomerNav";

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
        <p className="form-notice">Choose a platform to sign in and authorize your own social account. You do not need a developer Client ID or Client Secret; those are configured securely by the platform administrator.</p>
        {connection === "connected" && <p className="integration-feedback success" role="status">Account authorization completed successfully.</p>}
        {connection === "failed" && <p className="integration-feedback error" role="alert">Authorization could not be verified. Check the app settings, callback URL, and requested permissions, then try again.</p>}
        {connection === "denied" && <p className="integration-feedback" role="status">Authorization was cancelled. Your account remains disconnected.</p>}
        <div className="platform-grid">
          {SOCIAL_PLATFORMS.map((platform) => {
            const account = connected.find((entry) => entry.platform === platform);
            const hasCredentials = Boolean(getOAuthAppCredentials(platform) || account?.credentialsEncrypted);
            const configured = hasCredentials && (platform !== "WhatsApp" || Boolean(process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID));
            return (
              <div key={platform} className="platform-card">
                <div className="platform-header">
                  <span className="platform-logo">{platform[0]}</span>
                  <strong>{platform}</strong>
                </div>
                <p>{account?.connected ? "Connected" : configured ? "Ready to connect" : "Not configured by administrator"}</p>
                {account?.connected ? (
                  <span className="integration-status">Connected</span>
                ) : configured ? (
                  platform === "WhatsApp" ? (
                    <a href="/integrations/whatsapp" className="primary-btn">Connect WhatsApp Business</a>
                  ) : (
                    <a href={`/api/integrations/${encodeURIComponent(platform.toLowerCase())}/authorize`} className="primary-btn">Continue with {platform}</a>
                  )
                ) : (
                  <p className="form-hint">Ask the platform administrator to configure this platform’s app credentials in Railway.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
