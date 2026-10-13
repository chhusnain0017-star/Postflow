import type { Metadata } from "next";
import Link from "next/link";
import PublicSiteShell from "@/app/components/PublicSiteShell";

export const metadata: Metadata = {
  title: "PostFlow Plans and Access",
  description: "Learn about the PostFlow trial, workspace subscriptions, and how to request continued access.",
};

const periods = [
  { title: "1 month", description: "A flexible subscription period for a workspace." },
  { title: "6 months", description: "A longer access period for an established workflow." },
  { title: "1 year", description: "A full year of workspace access." },
];

export default function PlansPage() {
  return (
    <PublicSiteShell>
      <main className="public-subpage">
        <section className="public-page-intro">
          <p className="public-eyebrow">Plans and workspace access</p>
          <h1>Understand access before you get started.</h1>
          <p>PostFlow provides a seven-day trial for new customer accounts. After the trial, request a subscription period and the team will contact you about continuing workspace access.</p>
        </section>
        <section className="public-plan-grid" aria-label="Available subscription periods">
          {periods.map((period) => (
            <article className="public-plan-card" key={period.title}>
              <span className="public-plan-label">Workspace access</span>
              <h2>{period.title}</h2>
              <p>{period.description}</p>
            </article>
          ))}
        </section>
        <section className="public-note-panel">
          <h2>How requests are handled</h2>
          <p>PostFlow does not currently process online payments or automatically charge for renewals. Submitting a request is not a payment or activation. An administrator will contact you within 24 hours to discuss the selected period and access arrangements.</p>
          <p>Workspace members use access provided by their workspace owner. Administrators manage workspace membership, roles, and renewals.</p>
          <Link href="/terms" className="public-inline-link">Read the Terms of Service</Link>
        </section>
        <section className="public-bottom-cta">
          <div>
            <p className="public-eyebrow">Need access?</p>
            <h2>Request a workspace subscription.</h2>
            <p>Choose a period and provide a contact number so the administrator can follow up.</p>
          </div>
          <Link href="/upgrade" className="primary-btn">Request access</Link>
        </section>
      </main>
    </PublicSiteShell>
  );
}
