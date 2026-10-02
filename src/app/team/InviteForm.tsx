"use client";

import { useActionState } from "react";
import { createTeamInviteAction } from "@/app/actions";

export default function InviteForm({ allowAdminRole }: { allowAdminRole: boolean }) {
  const [state, action, pending] = useActionState(createTeamInviteAction, null);

  return (
    <div className="team-invite-block">
      <form action={action} className="team-invite-form">
        <label>
          <span>Work email</span>
          <input name="email" type="email" autoComplete="off" required />
        </label>
        <label>
          <span>Role</span>
          <select name="role" defaultValue="EDITOR">
            {allowAdminRole && <option value="ADMIN">Admin</option>}
            <option value="EDITOR">Editor</option>
            <option value="APPROVER">Approver</option>
            <option value="MEMBER">Member</option>
          </select>
        </label>
        <button type="submit" className="primary-btn" disabled={pending}>{pending ? "Creating invite..." : "Create invite"}</button>
      </form>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.inviteUrl && (
        <div className="invite-result">
          <p>Invite ready. Share this one-time link; it expires in 72 hours.</p>
          <a href={state.inviteUrl} target="_blank" rel="noreferrer">Open invite link</a>
          <input aria-label="Team invite link" value={state.inviteUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        </div>
      )}
    </div>
  );
}
