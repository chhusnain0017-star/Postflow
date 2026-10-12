import { redirect } from "next/navigation";
import CustomerNav from "@/app/components/CustomerNav";
import { requireCustomer } from "@/lib/access";
import { readStore } from "../../../../tests/store";
import FacebookPagePicker from "./FacebookPagePicker";

export default async function FacebookPagesPage() {
  const user = await requireCustomer();
  const account = readStore().socialAccounts.find(
    (entry) => entry.workspaceId === user.workspaceId && entry.platform === "Facebook",
  );
  if (!account?.pageSelectionRequired) {
    if (account?.connected) redirect("/integrations");
    redirect("/integrations?connection=failed");
  }

  return (
    <main className="app-shell">
      <CustomerNav active="integrations" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Step 2 of 2 · Select a Page</p>
        <h1>Connect your Facebook Page</h1>
        <p className="form-notice">Facebook authorization succeeded. Choose the Page you want PostFlow to connect. PostFlow will use the Page-specific permission token for authorized integrations.</p>
        <FacebookPagePicker />
      </section>
    </main>
  );
}
