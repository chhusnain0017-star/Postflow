"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ?? "admin@postflow.local";
const DEFAULT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD ?? "admin123";

export default function LoginPage() {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);

  const fillAdminCredentials = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Access portal</p>
        <h1>Welcome back</h1>

        <form action={loginAction} className="form-stack">
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary-btn">Login</button>
        </form>

        <div className="auth-actions">
          <button type="button" className="secondary-btn" onClick={fillAdminCredentials}>
            Admin
          </button>
          <a href="/request-access" className="text-link">Request access</a>
        </div>

        <div className="auth-links">
          <a href="/">Return home</a>
        </div>
      </section>
    </main>
  );
}
