import { requireCustomer } from "@/lib/access";
import CustomerNav from "@/app/components/CustomerNav";

export default async function SettingsPage() {
  const user = await requireCustomer();

  return (
    <main className="app-shell">
      <CustomerNav active="settings" role={user.role} />
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
