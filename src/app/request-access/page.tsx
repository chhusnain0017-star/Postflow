import { requestAccessAction } from "@/app/actions";

export default function RequestAccessPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Access required</p>
        <h1>Request a customer account</h1>
        <form action={requestAccessAction} className="form-stack">
          <label>
            <span>Name</span>
            <input name="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required />
          </label>
          <label>
            <span>Payment / access reference</span>
            <input name="paymentReference" required />
          </label>
          <button type="submit" className="primary-btn">Submit request</button>
        </form>
        <div className="auth-links">
          <a href="/login">Login</a>
          <a href="/">Home</a>
        </div>
      </section>
    </main>
  );
}
