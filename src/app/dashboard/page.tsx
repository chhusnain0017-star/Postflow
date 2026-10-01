import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  if (!session) redirect("/login");

  seedDemoData();
  const store = readStore();
  const user = store.users.find((entry) => entry.id === session.id) ?? null;
  if (!user || user.status !== "APPROVED") redirect("/waiting");

  const workspacePosts = store.posts.filter((post) => post.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">PostFlow</div>
        <nav>
          <a href="/dashboard" className="active">Overview</a>
          <a href="/create-post">Create Post</a>
          <a href="/integrations">Integrations</a>
          <a href="/history">History</a>
          <a href="/settings">Settings</a>
        </nav>
        <form action="/api/auth/logout" method="POST" className="logout-form">
          <button type="submit">Logout</button>
        </form>
      </aside>

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
