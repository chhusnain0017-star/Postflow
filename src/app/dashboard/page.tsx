import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";
import CustomerNav from "@/app/components/CustomerNav";

export default async function DashboardPage() {
  const user = await requireCustomer();
  const store = readStore();

  const workspacePosts = store.posts.filter((post) => post.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <CustomerNav active="dashboard" role={user.role} />

      <section className="content-panel">
        <h1>Customer dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card"><span>Connected platforms</span><strong>{store.socialAccounts.filter((account) => account.workspaceId === user.workspaceId && account.connected).length}</strong></div>
          <div className="stat-card"><span>Recent posts</span><strong>{workspacePosts.length}</strong></div>
          <div className="stat-card"><span>Access expiry</span><strong>{user.accessExpiryDate ? new Date(user.accessExpiryDate).toLocaleDateString() : "N/A"}</strong></div>
          <div className="stat-card"><span>Workspace</span><strong>{user.workspaceId}</strong></div>
        </div>

        <div className="card-block">
          <h2>Recent content</h2>
          <ul className="list-block">
            {workspacePosts.length ? workspacePosts.map((post) => (
              <li key={post.id}>
                <strong>{post.title}</strong>
                <span>{post.selectedPlatforms.join(", ")}</span>
                <span>{post.status}</span>
              </li>
            )) : <li>No posts yet. Create your first campaign.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
