"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestAccessAction } from "@/app/actions";

export default function RequestAccessForm() {
  const [state, action, pending] = useActionState(requestAccessAction, null);

  return (
    <form action={action} className="form-stack">
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
      <label className="agreement-check">
        <input type="checkbox" name="legalTerms" value="yes" required />
        <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
      </label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="primary-btn" disabled={pending}>
        {pending ? "Submitting request..." : "Submit request"}
      </button>
    </form>
  );
}
