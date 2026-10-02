import { redirect } from "next/navigation";
import { acceptTermsAction } from "@/app/actions";
import { requireSignedInUser } from "@/lib/access";

export default async function OnboardingPage() {
  const user = await requireSignedInUser();
  if (user.role === "SYSTEM_ADMIN") redirect("/admin");
  if (user.termsAcceptedAt) redirect("/dashboard");

  return (
    <main className="auth-shell">
      <section className="auth-card onboarding-card">
        <p className="eyebrow">Before you connect</p>
        <h1>Choose your accounts carefully.</h1>
        <div className="terms-copy">
          <p>Connections made for this PostFlow ID are permanent. Once social accounts are connected, you cannot replace them or connect a different account on this ID. A different set of accounts requires a new PostFlow ID.</p>
          <p>Your login is for your use only. Only one active session is allowed per ID; signing in again ends the previous session.</p>
          <p>Platform publishing is not active until the required provider OAuth setup is configured. Do not enter your social passwords into PostFlow.</p>
        </div>
        <form action={acceptTermsAction} className="form-stack">
          <label className="agreement-check">
            <input type="checkbox" name="acceptTerms" value="yes" required />
            <span>I understand and accept these account and integration terms.</span>
          </label>
          <button type="submit" className="primary-btn">Continue to dashboard</button>
        </form>
      </section>
    </main>
  );
}