import { requireAdmin } from "@/lib/access";
import { readStore } from "@/lib/store";

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
          {store.users.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.name}</strong>
              <span>{entry.email}</span>
              <span>{entry.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
