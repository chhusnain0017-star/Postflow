import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";

export default async function HistoryPage() {
  const user = await requireCustomer();
  const store = readStore();

  const posts = store.posts.filter((post) => post.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">PostFlow</div>
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/create-post">Create Post</a>
          <a href="/integrations">Integrations</a>
          <a href="/history" className="active">History</a>
          <a href="/settings">Settings</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Publishing history</h1>
        <ul className="list-block">
          {posts.map((post) => (
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
