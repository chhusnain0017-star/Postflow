import { requireAdmin } from "@/lib/access";
import { readStore } from "@/lib/store";
import { renewCustomerContractAction } from "@/app/actions";

export default async function AdminCustomersPage() {
  await requireAdmin();
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
      </section>
    </main>
  );
}
