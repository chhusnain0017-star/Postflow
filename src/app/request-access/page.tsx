import { requestAccessAction } from "@/app/actions";
import Link from "next/link";

export default function RequestAccessPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Access required</p>
        <h1>Request a customer account</h1>
        <form action={requestAccessAction} className="form-stack">
          <label>
            <span>Full name</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            <span>Username</span>
            <input name="username" autoComplete="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_.-]+" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="new-password" minLength={12} required />
          </label>
          <label>
            <span>Secret access code</span>
            <input name="inviteCode" type="password" autoComplete="off" required />
          </label>
          <button type="submit" className="primary-btn">Submit request</button>
        </form>
        <div className="auth-links">
          <a href="/login">Login</a>
          <Link href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
