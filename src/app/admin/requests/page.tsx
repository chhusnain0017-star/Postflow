import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { approveAccessRequestAction, rejectAccessRequestAction } from "@/app/actions";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

export default async function AdminRequestsPage() {
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
          <a href="/admin/customers">Customers</a>
          <a href="/admin/requests" className="active">Requests</a>
          <a href="/admin/monitoring">Publishing</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Access requests</h1>
        <ul className="list-block">
          {store.accessRequests.length === 0 ? (
            <li className="empty-state">No pending access requests.</li>
          ) : (
            store.accessRequests.map((entry) => (
              <li key={entry.id} className="request-item">
                <div className="request-meta">
                  <strong>{entry.name}</strong>
                  <span>{entry.email}</span>
                  <span>{entry.paymentReference}</span>
                  <span>{entry.status}</span>
                </div>
                <div className="request-actions">
                  <form action={approveAccessRequestAction}>
                    <input type="hidden" name="requestId" value={entry.id} />
                    <button type="submit" className="primary-btn">Approve</button>
                  </form>
                  <form action={rejectAccessRequestAction}>
                    <input type="hidden" name="requestId" value={entry.id} />
                    <button type="submit" className="secondary-btn">Reject</button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
