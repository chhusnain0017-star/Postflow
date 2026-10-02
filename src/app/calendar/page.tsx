import { requireCustomer } from "@/lib/access";
import { cancelScheduledPostAction, reschedulePostAction } from "@/app/actions";
import CustomerNav from "@/app/components/CustomerNav";
import ScheduleFields from "@/app/create-post/ScheduleFields";
import { readStore } from "@/lib/store";

export default async function CalendarPage() {
  const user = await requireCustomer();
  const store = readStore();
  const scheduledPosts = store.posts
    .filter((post) => post.workspaceId === user.workspaceId && post.status === "SCHEDULED" && post.scheduledAt)
    .sort((left, right) => Date.parse(left.scheduledAt!) - Date.parse(right.scheduledAt!));

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const firstWeekday = monthStart.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const postsByDay = new Map<string, typeof scheduledPosts>();
  for (const post of scheduledPosts) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: post.scheduleTimeZone ?? "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(post.scheduledAt!));
    const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const day = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    postsByDay.set(day, [...(postsByDay.get(day) ?? []), post]);
  }

  return (
    <main className="app-shell">
      <CustomerNav active="calendar" role={user.role} />
      <section className="content-panel">
        <div className="page-heading-row">
          <div><p className="eyebrow">Publishing plan</p><h1>{monthLabel}</h1></div>
          <a href="/create-post" className="primary-btn">Schedule a post</a>
        </div>
        <p className="form-notice">Scheduled posts are stored in the queue. Automatic publishing remains paused until each selected platform has a verified publishing connection.</p>
        <div className="calendar-grid" aria-label={`${monthLabel} publishing calendar`}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="calendar-weekday">{day}</div>)}
          {Array.from({ length: firstWeekday }, (_, index) => <div key={`blank-${index}`} className="calendar-day calendar-day-empty" />)}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entries = postsByDay.get(dateKey) ?? [];
            return (
              <div key={dateKey} className="calendar-day">
                <span className="calendar-date">{day}</span>
                {entries.map((post) => <span key={post.id} className="calendar-event" title={post.title}>{post.title}</span>)}
              </div>
            );
          })}
        </div>

        <section className="workspace-section">
          <div className="section-heading"><h2>Scheduled queue</h2><span>{scheduledPosts.length} queued</span></div>
          {scheduledPosts.length === 0 ? <p className="empty-state">No scheduled posts yet.</p> : (
            <ul className="queue-list">
              {scheduledPosts.map((post) => (
                <li key={post.id} className="queue-item">
                  <div className="queue-meta">
                    <strong>{post.title}</strong>
                    {post.campaignName && <span>{post.campaignName}</span>}
                    <span>{new Date(post.scheduledAt!).toLocaleString("en-US", { timeZone: post.scheduleTimeZone ?? "UTC" })} · {post.scheduleTimeZone ?? "UTC"} · {post.selectedPlatforms.join(", ")}</span>
                  </div>
                  {(post.createdById === user.id || user.role === "OWNER" || user.role === "ADMIN") && (
                    <div className="queue-actions">
                      <form action={reschedulePostAction} className="queue-reschedule-form">
                        <input type="hidden" name="postId" value={post.id} />
                        <ScheduleFields />
                        <button type="submit" className="secondary-btn">Update time</button>
                      </form>
                      <form action={cancelScheduledPostAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="secondary-btn">Remove</button>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}