import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCustomerPost } from "@/app/actions";
import { readStore, seedDemoData } from "@/lib/store";
import { verifySessionToken } from "@/lib/auth";

export default async function CreatePostPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get("postflow_session")?.value);
  if (!session) redirect("/login");

  seedDemoData();
  const store = readStore();
  const user = store.users.find((entry) => entry.id === session.id) ?? null;
  if (!user || user.status !== "APPROVED") redirect("/waiting");

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">PostFlow</div>
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/create-post" className="active">Create Post</a>
          <a href="/integrations">Integrations</a>
          <a href="/history">History</a>
          <a href="/settings">Settings</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Create post</h1>
        <form action={createCustomerPost} className="form-stack big-form">
          <label>
            <span>Title</span>
            <input name="title" required />
          </label>
          <label>
            <span>Description</span>
            <textarea name="description" rows={5} required />
          </label>
          <label>
            <span>Hashtags</span>
            <input name="hashtags" placeholder="#launch #social #creator" />
          </label>
          <div className="platform-selection">
            {[
              "Facebook",
              "Instagram",
              "YouTube",
              "X",
              "Pinterest",
              "Threads",
            ].map((platform) => (
              <label key={platform} className="checkbox-option">
                <input type="checkbox" name="platforms" value={platform} defaultChecked={platform === "Facebook" || platform === "YouTube"} />
                {platform}
              </label>
            ))}
          </div>
          <button type="submit" className="primary-btn">Publish now</button>
        </form>
      </section>
    </main>
  );
}
