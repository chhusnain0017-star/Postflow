import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicSiteShell from "@/app/components/PublicSiteShell";

export const metadata: Metadata = {
  title: "PostFlow | Plan, review, and manage social content",
  description: "A practical workspace for teams to organize social content, manage media, review posts, schedule work, and connect supported social accounts.",
};

const features = [
  {
    number: "01",
    title: "Plan in one workspace",
    description: "Keep post drafts, campaign details, channels, dates, and time zones together instead of scattered across separate documents.",
    href: "/features#planning",
  },
  {
    number: "02",
    title: "Keep media organized",
    description: "Upload and organize images, video, audio, and documents alongside the content your team is preparing.",
    href: "/features#media",
  },
  {
    number: "03",
    title: "Review before publishing",
    description: "Give teammates workspace roles, route content for approval, and keep a record of review decisions.",
    href: "/features#approvals",
  },
  {
    number: "04",
    title: "Connect with care",
    description: "Authorize supported social accounts separately and use each connection only for the features you choose.",
    href: "/features#integrations",
  },
];

export default function Home() {
  return (
    <PublicSiteShell>
      <main>
        <section className="public-hero">
          <div className="public-hero-copy">
            <p className="public-eyebrow">A clearer way to coordinate social content</p>
            <h1>Plan together.<br />Publish with purpose.</h1>
            <p className="public-lede">PostFlow gives teams one organized place to prepare social posts, manage media, coordinate approvals, schedule work, and review available performance reports.</p>
            <div className="public-actions">
              <Link href="/features" className="primary-btn">Explore PostFlow</Link>
              <Link href="/login" className="secondary-btn">Sign in with Google</Link>
            </div>
            <p className="public-caption">Built for teams that want a considered workflow from draft to review.</p>
          </div>
          <div className="product-preview" aria-label="Illustration of a PostFlow content calendar">
            <div className="preview-topbar">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
              <strong>Workspace calendar</strong>
              <span className="preview-month">October · Week 2</span>
            </div>
            <div className="preview-grid">
              <div className="preview-day"><span>MON</span><strong>12</strong><i className="preview-post preview-post-coral">Product story</i></div>
              <div className="preview-day"><span>TUE</span><strong>13</strong><i className="preview-post preview-post-blue">Behind the scenes</i></div>
              <div className="preview-day"><span>WED</span><strong>14</strong><i className="preview-post preview-post-green">Campaign update</i></div>
              <div className="preview-day"><span>THU</span><strong>15</strong><i className="preview-post preview-post-violet">Team review</i></div>
              <div className="preview-day"><span>FRI</span><strong>16</strong><i className="preview-post preview-post-gold">Weekly recap</i></div>
            </div>
            <div className="preview-status"><span className="preview-status-check">✓</span><span><strong>Review in progress</strong><small>Content stays visible to your workspace team</small></span></div>
          </div>
        </section>

        <section className="public-section public-intro-section">
          <div className="public-section-heading">
            <p className="public-eyebrow">One practical workflow</p>
            <h2>From first idea to team-ready post</h2>
            <p>Plan content, gather the right assets, and give teammates a clear way to review work. PostFlow keeps the details connected without promising that a scheduled item has been published by a social platform.</p>
          </div>
          <div className="public-feature-grid">
            {features.map((feature) => (
              <Link href={feature.href} className="public-feature-card" key={feature.number}>
                <span className="public-feature-number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="public-card-link">Learn more <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="public-workflow-band">
          <div>
            <p className="public-eyebrow">Made for the whole team</p>
            <h2>Useful structure, without losing sight of the work.</h2>
            <p>Organize drafts and media, set schedules with the right time zone, invite collaborators, review changes, and see the status of your connected accounts from the workspace.</p>
          </div>
          <Link href="/how-it-works" className="secondary-btn">See how it works</Link>
        </section>

        <section className="public-section public-integrations-section">
          <div className="public-section-heading">
            <p className="public-eyebrow">Connected accounts</p>
            <h2>Your accounts. Your authorization.</h2>
            <p>PostFlow supports account connections for Facebook, Instagram, TikTok, Threads, YouTube, Pinterest, X, and WhatsApp Business. Each provider has its own permissions and review process; available actions depend on your account, configuration, and platform approval.</p>
          </div>
          <div className="public-platform-list" aria-label="Social platforms">
            {["Facebook", "Instagram", "TikTok", "Threads", "YouTube", "Pinterest", "X", "WhatsApp Business"].map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </div>
          <p className="public-disclaimer">A saved draft or scheduled item is not confirmation that a third-party platform has received or published it. Check the relevant platform for final status.</p>
        </section>

        <section className="public-trust-panel">
          <div className="trust-mark" aria-hidden="true"><Image src="/postflow-logo-green.png" alt="" width={56} height={56} /></div>
          <div>
            <p className="public-eyebrow">Privacy and transparency</p>
            <h2>Know what you are connecting.</h2>
            <p>Google sign-in verifies your identity; it does not connect your YouTube channel. YouTube access is requested separately only if you choose to connect that account.</p>
          </div>
          <div className="trust-links">
            <Link href="/privacy">Read the Privacy Policy</Link>
            <Link href="/terms">Read the Terms of Service</Link>
            <Link href="/delete-account">Account deletion requests</Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
