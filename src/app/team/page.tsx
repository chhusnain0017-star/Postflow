import { requireTeamManager } from "@/lib/access";
import { suspendTeamMemberAction, updateTeamMemberAction } from "@/app/actions";
import CustomerNav from "@/app/components/CustomerNav";
import InviteForm from "@/app/team/InviteForm";
import { readStore } from "@/lib/store";

const roles = ["ADMIN", "EDITOR", "APPROVER", "MEMBER"] as const;

export default async function TeamPage() {
  const manager = await requireTeamManager();
  const store = readStore();
  const members = store.users.filter((user) => user.workspaceId === manager.workspaceId
    && user.role !== "OWNER" && user.role !== "SYSTEM_ADMIN");
  const invites = store.teamInvites.filter((invite) => invite.workspaceId === manager.workspaceId
    && !invite.acceptedAt && Date.parse(invite.expiresAt) > Date.now());

  return (
    <main className="app-shell">
      <CustomerNav active="team" role={manager.role} />
      <section className="content-panel">
        <p className="eyebrow">Workspace access</p>
        <h1>Team</h1>
        <section className="workspace-section">
          <div className="section-heading"><h2>Invite a teammate</h2></div>
          <p className="form-hint">Invites are single-use and expire after 72 hours. Share the generated link directly; PostFlow does not send email.</p>
          <InviteForm allowAdminRole={manager.role === "OWNER"} />
        </section>

        <section className="workspace-section">
          <div className="section-heading"><h2>Members</h2><span>{members.length} members</span></div>
          {members.length === 0 ? <p className="empty-state">No teammates have joined this workspace.</p> : (
            <ul className="team-list">
              {members.map((member) => (
                <li key={member.id} className="team-row">
                  <div className="team-member-info">
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                    <span className={member.status === "APPROVED" ? "member-status-active" : "member-status-paused"}>{member.status}</span>
                  </div>
                  <div className="team-member-actions">
                    <form action={updateTeamMemberAction} className="team-role-form">
                      <input type="hidden" name="memberId" value={member.id} />
                      <select name="role" defaultValue={member.role} aria-label={`Role for ${member.name}`}>
                        {roles.filter((role) => manager.role === "OWNER" || role !== "ADMIN").map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <button type="submit" className="secondary-btn">Save role</button>
                    </form>
                    <form action={suspendTeamMemberAction}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <button type="submit" className="secondary-btn">{member.status === "SUSPENDED" ? "Reactivate" : "Suspend"}</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="workspace-section">
          <div className="section-heading"><h2>Pending invites</h2><span>{invites.length}</span></div>
          {invites.length === 0 ? <p className="empty-state">No pending invites.</p> : (
            <ul className="list-block">
              {invites.map((invite) => <li key={invite.id}><strong>{invite.email}</strong><span>{invite.role}</span><span>Expires {new Date(invite.expiresAt).toLocaleString()}</span></li>)}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}