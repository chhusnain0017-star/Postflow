import Link from "next/link";

export default async function WaitingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const expired = status === "expired";

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">{expired ? "Trial ended" : "Sign-in required"}</p>
        <h1>{expired ? "Your free trial has ended" : "Continue with Google"}</h1>
        <p>{expired
          ? "Request a subscription plan and we’ll contact you within 24 hours to help you continue using PostFlow."
          : "Sign in with your Google account to start or continue your PostFlow workspace."}</p>
        <Link href={expired ? "/upgrade?status=expired" : "/login"} className="primary-btn inline-link">{expired ? "View subscription plans" : "Continue with Google"}</Link>
      </section>
    </main>
  );
}
