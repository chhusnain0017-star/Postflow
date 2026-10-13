import type { Metadata } from "next";
import Link from "next/link";
import PublicSiteShell from "@/app/components/PublicSiteShell";

export const metadata: Metadata = {
  title: "PostFlow Features | Content planning, review, and reporting",
  description: "Explore PostFlow workspace features for social content planning, media organization, team approvals, social connections, and reports.",
};

const featureDetails = [
  {
    id: "planning",
    number: "01",
    title: "Content planning and scheduling",
    description: "Keep post ideas, captions, hashtags, campaigns, target platforms, publication dates, and time zones together. Use the calendar and queue to see what is planned and what still needs attention.",
    points: ["Drafts and scheduled queue entries", "Calendar views with local time-zone context", "Campaign names and selected publishing destinations"],
  },
  {
    id: "media",
    number: "02",
    title: "A library for your creative assets",
    description: "Upload and organize files alongside the work they support. The media library keeps asset details available to your workspace so the team can find and reuse the right material.",
    points: ["Image, video, audio, and document uploads", "Asset details, tags, and upload history", "Workspace access controls for stored files"],
  },
  {
    id: "approvals",
    number: "03",
    title: "Review and team coordination",
    description: "Give each teammate an appropriate workspace role. Send work for review, let eligible approvers approve or return it to drafts, and keep the decision history with the content.",
    points: ["Workspace owners, administrators, editors, and members", "Approval and return-to-draft workflow", "Invitations and workspace activity records"],
  },
  {
    id: "integrations",
    number: "04",
    title: "Provider connections you control",
    description: "Authorize a social account through its own provider screen when you are ready. PostFlow requests access separately for each connection and uses it only for the features you ask to use.",
    points: ["Facebook, Instagram, TikTok, Threads, YouTube, Pinterest, X, and WhatsApp Business", "Provider-specific consent and permissions", "Connection status and account identity in the workspace"],
  },
  {
    id: "reports",
    number: "05",
    title: "Workspace reports",
    description: "Review post-performance information available to your workspace and export reports for further analysis. Available measures depend on the information supplied to PostFlow.",
    points: ["Performance snapshots associated with posts and platforms", "Engagement measures when available", "CSV export for authorized workspace users"],
  },
];

export default function FeaturesPage() {
  return (
    <PublicSiteShell>
      <main className="public-subpage">
        <section className="public-page-intro">
          <p className="public-eyebrow">PostFlow features</p>
          <h1>The tools to move a post through your team.</h1>
          <p>PostFlow brings planning, media, review, connected accounts, and reporting into a shared workspace. Use the parts that fit your process and connect a provider only when you choose to.</p>
          <Link href="/how-it-works" className="primary-btn">Explore the workflow</Link>
        </section>
        <nav className="public-inpage-nav" aria-label="On this page">
          {featureDetails.map((feature) => <a href={`#${feature.id}`} key={feature.id}>{feature.title}</a>)}
        </nav>
        <div className="public-detail-list">
          {featureDetails.map((feature) => (
            <article className="public-detail-row" id={feature.id} key={feature.id}>
              <span className="public-detail-number">{feature.number}</span>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
                <ul>{feature.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
        <section className="public-note-panel">
          <h2>What a schedule does—and does not—mean</h2>
          <p>PostFlow can save drafts and scheduled queue entries. Publishing depends on a configured provider connection, supported workflows, permissions, and platform availability. A schedule is not proof of delivery; verify the final status with the social platform.</p>
        </section>
      </main>
    </PublicSiteShell>
  );
}
