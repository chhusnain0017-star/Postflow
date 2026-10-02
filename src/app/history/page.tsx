import { requireCustomer } from "@/lib/access";
import { readStore } from "@/lib/store";
import CustomerNav from "@/app/components/CustomerNav";

export default async function HistoryPage() {
  const user = await requireCustomer();
  const store = readStore();

  const posts = store.posts.filter((post) => post.workspaceId === user.workspaceId);

  return (
    <main className="app-shell">
      <CustomerNav active="history" role={user.role} />
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
