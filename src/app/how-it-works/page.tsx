import type { Metadata } from "next";
import Link from "next/link";
import PublicSiteShell from "@/app/components/PublicSiteShell";

export const metadata: Metadata = {
  title: "How PostFlow Works | From draft to review",
  description: "Learn how teams use PostFlow to organize content, collaborate on reviews, connect social accounts, and track available performance information.",
};

const steps = [
  {
    number: "01",
    title: "Set up your workspace",
    description: "Sign in with a Google account or accept a workspace invitation. New customer accounts start with a seven-day trial; workspace roles and access are managed by the owner or administrator.",
  },
  {
    number: "02",
    title: "Prepare content and media",
    description: "Create a draft, add captions and campaign details, select intended platforms, set a date and time zone, and upload the assets your team needs.",
  },
  {
    number: "03",
    title: "Review with teammates",
    description: "Invite team members with the right roles. Submit work for review, record an approval or return it for changes, and keep the decision associated with the post.",
  },
  {
    number: "04",
    title: "Connect an account when ready",
    description: "Choose a supported provider and authorize your own account on that provider’s site. Each connection has its own consent, permissions, and platform-specific requirements.",
  },
  {
    number: "05",
    title: "Check the queue and reports",
    description: "Review scheduled entries and available post-performance information in your workspace. Export reports as CSV when you need to share or analyze the data elsewhere.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicSiteShell>
      <main className="public-subpage">
        <section className="public-page-intro">
          <p className="public-eyebrow">How PostFlow works</p>
          <h1>A thoughtful workflow, from draft through review.</h1>
          <p>PostFlow helps a workspace keep the details of social content together, so people know what is being prepared, who is reviewing it, and which accounts have been connected.</p>
        </section>
        <ol className="public-step-list">
          {steps.map((step) => (
            <li className="public-step" key={step.number}>
              <span className="public-step-number">{step.number}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <section className="public-note-panel public-provider-note">
          <h2>Provider actions remain with each platform</h2>
          <p>PostFlow does not guarantee platform approval, delivery, or publication. You choose the account and permissions on the provider’s authorization screen, and should check that provider for the final status of any content.</p>
          <p>Google sign-in is separate from YouTube authorization. Signing in verifies your identity and does not give PostFlow access to your YouTube channel.</p>
        </section>
        <div className="public-bottom-cta">
          <div>
            <p className="public-eyebrow">Explore your options</p>
            <h2>See the features and workspace access details.</h2>
          </div>
          <div className="public-actions">
            <Link href="/features" className="secondary-btn">View features</Link>
            <Link href="/plans" className="primary-btn">Plans and access</Link>
          </div>
        </div>
      </main>
    </PublicSiteShell>
  );
}
