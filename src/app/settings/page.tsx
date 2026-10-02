import { requireCustomer } from "@/lib/access";

export default async function SettingsPage() {
  const user = await requireCustomer();

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div className="brand">PostFlow</div>
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/create-post">Create Post</a>
          <a href="/integrations">Integrations</a>
          <a href="/history">History</a>
          <a href="/settings" className="active">Settings</a>
        </nav>
      </aside>
      <section className="content-panel">
        <h1>Account and access</h1>
        <div className="card-block">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Status: {user.status}</p>
          <p>Access expires: {user.accessExpiryDate ? new Date(user.accessExpiryDate).toLocaleString() : "Not set"}</p>
        </div>
      </section>
    </main>
  );
}
