import { createHash } from "node:crypto";
import { acceptTeamInviteAction } from "@/app/actions";
import Link from "next/link";
import { readStore } from "@/lib/store";

export default async function AcceptTeamInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invite = token ? readStore().teamInvites.find((entry) => entry.tokenHash === tokenHash) : undefined;
  const valid = Boolean(invite && !invite.acceptedAt && Date.parse(invite.expiresAt) > Date.now());

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Team invitation</p>
        <h1>{valid ? "Join the workspace" : "Invite unavailable"}</h1>
        {!valid || !invite ? <p>This invite is expired, already used, or invalid. Ask the workspace owner for a new link.</p> : (
          <>
            <p>Join as <strong>{invite.role}</strong> with <strong>{invite.email}</strong>.</p>
            <form action={acceptTeamInviteAction} className="form-stack">
              <input type="hidden" name="token" value={token} />
              <label><span>Full name</span><input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
              <label><span>Username</span><input name="username" autoComplete="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_.-]+" required /></label>
              <label><span>Password</span><input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
              <label className="agreement-check"><input type="checkbox" name="legalTerms" value="yes" required /><span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</span></label>
              <button type="submit" className="primary-btn">Accept invitation</button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}