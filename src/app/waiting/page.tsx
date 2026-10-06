import Link from "next/link";

export default async function WaitingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const expired = status === "expired";

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">{expired ? "Contract ended" : "Approval status"}</p>
        <h1>{expired ? "Your access has expired" : "Request received — approval required"}</h1>
        <p>{expired
          ? "Your one-year contract has ended and account access is stopped. Contact the administrator to arrange renewal; sign in again after the renewal is confirmed."
          : "Your access request was submitted successfully. This is not an active account yet. The platform administrator must approve it under Admin → Requests. After approval, sign in with the email address and password you entered in the request."}</p>
        <Link href="/" className="primary-btn inline-link">Back home</Link>
      </section>
    </main>
  );
}
