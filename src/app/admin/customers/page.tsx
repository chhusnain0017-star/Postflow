import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  if (!session) redirect("/login");
  seedDemoData();
  const store = readStore();
  const user = store.users.find((entry) => entry.id === session.id);
  if (!user || user.role !== "SYSTEM_ADMIN") redirect("/");

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
