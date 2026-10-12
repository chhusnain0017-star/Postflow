import Image from "next/image";
import Link from "next/link";
import LegalLinks from "@/app/components/LegalLinks";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = error === "google-not-configured"
    ? "Google sign-in is not configured yet. Please contact the administrator."
    : error
      ? "Google sign-in could not be completed. Please try again."
      : null;

  return (
    <main className="auth-shell">
      <section className="auth-card google-auth-card">
        <Image src="/postflow-logo-green.png" alt="PostFlow" width={76} height={76} className="auth-logo" priority />
        <p className="eyebrow">Welcome to PostFlow</p>
        <h1>Plan your social posts in one place</h1>
        <p className="auth-description">Continue securely with your Google account. Your 7-day free trial starts as soon as you sign in.</p>
        {message && <p className="form-error" role="alert">{message}</p>}
        <a href="/api/auth/google" className="google-signin-btn">
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </a>
        <p className="auth-footnote">New accounts include a 7-day free trial. You can request a subscription at any time.</p>
        <Link href="/" className="text-link">Back to PostFlow</Link>
        <LegalLinks />
      </section>
    </main>
  );
}
