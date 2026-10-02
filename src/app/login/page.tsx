"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";

export default function LoginPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">{isAdminMode ? "Admin access" : "Access portal"}</p>
        <h1>{isAdminMode ? "Admin login" : "Welcome back"}</h1>

        <div className="auth-mode-switch" aria-label="Authentication mode selector">
          <button type="button" className={!isAdminMode ? "mode-btn active" : "mode-btn"} onClick={() => setIsAdminMode(false)}>
            Login
          </button>
          <button type="button" className={isAdminMode ? "mode-btn active" : "mode-btn"} onClick={() => setIsAdminMode(true)}>
            Admin login
          </button>
        </div>

        <form action={loginAction} className="form-stack">
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder={isAdminMode ? "admin@yourdomain.com" : "you@example.com"} required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder={isAdminMode ? "Enter admin password" : "Enter your password"} required />
          </label>

          <button type="submit" className="primary-btn">{isAdminMode ? "Admin login" : "Login"}</button>
        </form>

        <div className="auth-links">
          <a href="/request-access">Request access</a>
          <a href="/">Return home</a>
        </div>
      </section>
    </main>
  );
}
