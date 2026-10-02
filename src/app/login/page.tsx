"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";

export default function LoginPage({ adminOnly = false }: { adminOnly?: boolean }) {
  const [isAdminMode, setIsAdminMode] = useState(adminOnly);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">{isAdminMode ? "Admin Access" : "Access Portal"}</p>
        <h1>{isAdminMode ? "Admin login" : "Welcome back"}</h1>

        {!adminOnly && <div className="auth-mode-switch" aria-label="Authentication mode selector">
          <button type="button" className={!isAdminMode ? "mode-btn active" : "mode-btn"} onClick={() => setIsAdminMode(false)}>
            Login
          </button>
          <button type="button" className={isAdminMode ? "mode-btn active" : "mode-btn"} onClick={() => setIsAdminMode(true)}>
            Admin login
          </button>
        </div>}

        <form action={loginAction} className="form-stack">
          <input type="hidden" name="loginMode" value={isAdminMode ? "admin" : "customer"} />
          <label>
            <span>{isAdminMode ? "Admin email" : "Username or email"}</span>
            <input name="identifier" type={isAdminMode ? "email" : "text"} autoComplete="username" placeholder={isAdminMode ? "admin@yourdomain.com" : "Your username or email"} required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder={isAdminMode ? "Enter admin password" : "Enter your password"} required />
          </label>

          <button type="submit" className="primary-btn">{isAdminMode ? "Admin login" : "Login"}</button>
        </form>

        <div className="auth-links">
          {!adminOnly && <a href="/request-access">Request access</a>}
          <a href={adminOnly ? "/login" : "/"}>{adminOnly ? "Customer login" : "Return home"}</a>
        </div>
      </section>
    </main>
  );
}
