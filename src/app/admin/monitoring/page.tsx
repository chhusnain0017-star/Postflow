import { requireAdmin } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function AdminMonitoringPage() {
  await requireAdmin();
  const store = readStore();

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">Admin</div>
        <nav>
          <a href="/admin">Overview</a>
          <a href="/admin/customers">Customers</a>
          <a href="/admin/requests">Requests</a>
          <a href="/admin/monitoring" className="active">Publishing</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Publishing monitor</h1>
        <ul className="list-block">
          {store.posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <span>{post.selectedPlatforms.join(", ")}</span>
              <span>{post.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
