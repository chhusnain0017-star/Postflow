import { requireAdmin } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function AdminPage() {
  await requireAdmin();
  const store = readStore();

  const pending = store.users.filter((entry) => entry.status === "PENDING");
  const active = store.users.filter((entry) => entry.status === "APPROVED");
  const totalPosts = store.posts.length;

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">Admin</div>
        <nav>
          <a href="/admin" className="active">Overview</a>
          <a href="/admin/customers">Customers</a>
          <a href="/admin/requests">Requests</a>
          <a href="/admin/monitoring">Publishing</a>
        </nav>
        <form action="/api/auth/logout" method="POST" className="logout-form">
          <button type="submit">Logout</button>
        </form>
      </aside>

      <section className="content-panel">
        <h1>System administration</h1>
        <div className="stats-grid">
          <div className="stat-card"><span>Total customers</span><strong>{store.users.length}</strong></div>
          <div className="stat-card"><span>Pending</span><strong>{pending.length}</strong></div>
          <div className="stat-card"><span>Active</span><strong>{active.length}</strong></div>
          <div className="stat-card"><span>Posts</span><strong>{totalPosts}</strong></div>
        </div>

        <div className="card-block">
          <h2>Customer overview</h2>
          <ul className="list-block">
            {store.users.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.name}</strong>
                <span>{entry.email}</span>
                <span>{entry.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
