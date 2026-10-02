import { requirePostApprover } from "@/lib/access";
import { approvePostAction, rejectPostAction } from "@/app/actions";
import CustomerNav from "@/app/components/CustomerNav";
import { readStore } from "@/lib/store";

export default async function ApprovalsPage() {
  const user = await requirePostApprover();
  const store = readStore();
  const pendingPosts = store.posts.filter((post) => post.workspaceId === user.workspaceId
    && post.status === "PENDING_APPROVAL" && post.approvalStatus === "PENDING");

  return (
    <main className="app-shell">
      <CustomerNav active="approvals" role={user.role} />
      <section className="content-panel">
        <p className="eyebrow">Team workflow</p>
        <h1>Post approvals</h1>
        {pendingPosts.length === 0 ? <p className="empty-state">No posts are waiting for approval.</p> : (
          <ul className="approval-list">
            {pendingPosts.map((post) => {
              const author = store.users.find((member) => member.id === post.createdById);
              return (
                <li key={post.id} className="approval-item">
                  <div>
                    <h2>{post.title}</h2>
                    {post.campaignName && <p>{post.campaignName}</p>}
                    <p>{post.description}</p>
                    <span>By {author?.name ?? "Team member"} · {post.selectedPlatforms.join(", ")}</span>
                    {post.scheduledAt && <span> · {new Date(post.scheduledAt).toLocaleString()}</span>}
                  </div>
                  {post.createdById !== user.id ? (
                    <div className="request-actions">
                      <form action={approvePostAction}><input type="hidden" name="postId" value={post.id} /><button type="submit" className="primary-btn">Approve</button></form>
                      <form action={rejectPostAction}><input type="hidden" name="postId" value={post.id} /><button type="submit" className="secondary-btn">Return to draft</button></form>
                    </div>
                  ) : <span className="integration-status">You cannot approve your own post</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}