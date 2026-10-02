import { decryptProviderCredentials } from "@/lib/auth";
import CustomerNav from "@/app/components/CustomerNav";
import IntegrationSetupModal from "@/app/integrations/IntegrationSetupModal";
import WhatsAppSignupButton from "@/app/integrations/whatsapp/WhatsAppSignupButton";
import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function WhatsAppConnectPage() {
  const user = await requireCustomer();
  const account = readStore().socialAccounts.find((entry) => entry.workspaceId === user.workspaceId && entry.platform === "WhatsApp");
  const configId = process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID;
  const clientId = account?.credentialsEncrypted ? decryptProviderCredentials(account.credentialsEncrypted).clientId : "";

  return (
    <main className="app-shell">
      <CustomerNav active="integrations" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Meta Business onboarding</p>
        <h1>Connect WhatsApp Business</h1>
        <p className="form-notice">Meta Embedded Signup verifies the business, WhatsApp Business Account, and phone number. Enter the six-digit WhatsApp two-step PIN used to register the number.</p>
        <p className="form-hint">The saved Client ID must belong to the Meta app that owns WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID. Meta app review, business permissions, and a configured webhook are required.</p>
        {account?.connected ? (
          <div className="integration-status connected-status">Connected · {account.accountName}</div>
        ) : !account?.credentialsEncrypted ? (
          <IntegrationSetupModal platform="WhatsApp" />
        ) : !configId ? (
          <p className="form-error">WhatsApp Embedded Signup is not configured by the platform administrator. Set WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID in Railway before connecting.</p>
        ) : (
          <WhatsAppSignupButton appId={clientId} configId={configId} />
        )}
      </section>
    </main>
  );
}