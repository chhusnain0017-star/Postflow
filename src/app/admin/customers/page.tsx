import { requireAdmin } from "@/lib/access";
import { readStore } from "@/lib/store";
import { renewCustomerContractAction } from "@/app/actions";
import AdminIntegrationRemovalForm from "@/app/admin/customers/AdminIntegrationRemovalForm";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ integration?: string }>;
}) {
  await requireAdmin();
  const { integration } = await searchParams;
  const store = readStore();

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">Admin</div>
        <nav>
          <a href="/admin">Overview</a>
          <a href="/admin/customers" className="active">Customers</a>
          <a href="/admin/requests">Requests</a>
          <a href="/admin/monitoring">Publishing</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Customer management</h1>
        {integration === "removed" && <p className="integration-feedback success" role="status">Saved credentials and stored connection tokens were removed. The customer can now configure the platform again.</p>}
        <ul className="list-block">
          {store.users.map((entry) => {
            const expired = entry.role !== "SYSTEM_ADMIN" && (entry.status === "EXPIRED"
              || Boolean(entry.accessExpiryDate && Date.parse(entry.accessExpiryDate) <= Date.now()));
            return (
              <li key={entry.id}>
                <strong>{entry.name}</strong>
                <span>{entry.email}</span>
                <span>{expired ? "EXPIRED" : entry.status}</span>
                <span>{entry.accessExpiryDate ? `Contract ends ${new Date(entry.accessExpiryDate).toLocaleDateString()}` : "No expiry date"}</span>
                {expired && <form action={renewCustomerContractAction}><input type="hidden" name="customerId" value={entry.id} /><button type="submit" className="primary-btn">Renew after payment</button></form>}
              </li>
            );
          })}
        </ul>
        <section className="card-block">
          <h2>Customer platform credentials</h2>
          <p className="form-hint">Remove a customer’s saved platform credentials and locally stored connection tokens to let them set the platform up again. This does not revoke access with the platform provider. Secrets are never displayed here.</p>
          {store.socialAccounts.length === 0 ? (
            <p className="empty-state">No customer platform credentials are configured.</p>
          ) : (
            <ul className="list-block">
              {store.socialAccounts.map((account) => {
                const workspaceUsers = store.users.filter((entry) => entry.workspaceId === account.workspaceId
                  && entry.role !== "SYSTEM_ADMIN");
                const customer = workspaceUsers.find((entry) => entry.role === "OWNER")
                  ?? workspaceUsers.find((entry) => entry.role === "ADMIN")
                  ?? workspaceUsers[0];
                return (
                  <li key={account.id}>
                    <strong>{account.platform} · {customer?.name ?? "Unknown customer"}</strong>
                    <span>{customer?.email ?? "Customer account not found"}</span>
                    <span>{account.connected ? "Connected" : account.credentialsEncrypted ? "Credentials saved; not connected" : "Not connected"}</span>
                    {customer && <AdminIntegrationRemovalForm
                      accountId={account.id}
                      platform={account.platform}
                      customerEmail={customer.email}
                    />}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
