import Link from "next/link";
import LegalLinks from "@/app/components/LegalLinks";
import RequestAccessForm from "./RequestAccessForm";

export default function RequestAccessPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Access required</p>
        <h1>Request a customer account</h1>
        <RequestAccessForm />
        <div className="auth-links">
          <a href="/login">Login</a>
          <Link href="/">Home</Link>
        </div>
        <LegalLinks />
      </section>
    </main>
  );
}
