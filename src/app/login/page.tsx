import { loginAction } from "@/app/actions";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Access portal</p>
        <h1>Welcome back</h1>
        <form action={loginAction} className="form-stack">
          <label>
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="primary-btn">Login</button>
        </form>
        <div className="auth-links">
          <a href="/request-access">Request access</a>
          <a href="/">Return home</a>
        </div>
      </section>
    </main>
  );
}
