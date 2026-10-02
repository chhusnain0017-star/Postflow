import { requireAdmin } from "@/lib/access";
import { approveAccessRequestAction, rejectAccessRequestAction } from "@/app/actions";
import { readStore } from "@/lib/store";

export default async function AdminRequestsPage() {
  await requireAdmin();
  const store = readStore();

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
                  <span>@{entry.username}</span>
                  <span>{entry.email}</span>
                  <span>{entry.inviteCodeVerified ? "Access code verified" : "Legacy request"}</span>
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
