import CustomerNav from "@/app/components/CustomerNav";
import WhatsAppSignupButton from "@/app/integrations/whatsapp/WhatsAppSignupButton";
import { decryptProviderCredentials } from "@/lib/auth";
import { getOAuthAppCredentials } from "@/lib/oauth";
import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function WhatsAppConnectPage() {
  const user = await requireCustomer();
  const account = readStore().socialAccounts.find((entry) => entry.workspaceId === user.workspaceId && entry.platform === "WhatsApp");
  const configId = process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID;
  const clientId = getOAuthAppCredentials("WhatsApp")?.clientId
    ?? (account?.credentialsEncrypted ? decryptProviderCredentials(account.credentialsEncrypted).clientId : "");
  return (
    <main className="app-shell">
      <CustomerNav active="integrations" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Meta Business onboarding</p>
        <h1>Connect WhatsApp Business</h1>
        <p className="form-notice">Meta Embedded Signup verifies the business, WhatsApp Business Account, and phone number. Enter the six-digit WhatsApp two-step PIN used to register the number.</p>
        <p className="form-hint">The platform administrator configures the Meta app. Meta app review, business permissions, and a configured webhook are required.</p>
        {account?.connected ? (
          <div className="integration-status connected-status">Connected · {account.accountName}</div>
        ) : !clientId || !configId ? (
          <p className="form-error">WhatsApp is not configured yet. The platform administrator must set META_CLIENT_ID, META_CLIENT_SECRET, and WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID in Railway.</p>
        ) : (
          <WhatsAppSignupButton appId={clientId} configId={configId} />
        )}
      </section>
    </main>
  );
}