import Link from "next/link";
import RequestAccessForm from "@/app/request-access/RequestAccessForm";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ status?: string; plan?: string }> }) {
  const { status, plan } = await searchParams;
  return (
    <main className="auth-shell">
      <section className="upgrade-card">
        <p className="eyebrow">{status === "expired" ? "Trial ended" : "PostFlow plans"}</p>
        <h1>{status === "expired" ? "Choose a plan to continue" : "Upgrade your PostFlow workspace"}</h1>
        <p className="auth-description">
          {status === "expired"
            ? "Your 7-day free trial has ended. Request a subscription and we’ll contact you within 24 hours to help keep your workspace active."
            : "Choose a subscription period and request access. There is no online payment at this stage."}
        </p>
        <RequestAccessForm initialPlan={plan} />
        <Link href="/login" className="text-link upgrade-signin-link">Back to sign in</Link>
      </section>
    </main>
  );
}
