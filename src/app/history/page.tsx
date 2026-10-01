import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  if (!session) redirect("/login");

  seedDemoData();
  const store = readStore();
  const user = store.users.find((entry) => entry.id === session.id) ?? null;
  if (!user || user.status !== "APPROVED") redirect("/waiting");

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
