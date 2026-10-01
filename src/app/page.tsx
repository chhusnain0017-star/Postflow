import { seedDemoData } from "@/lib/store";

export default function Home() {
  seedDemoData();

  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <h1>Upload once.<br />Posts everywhere.</h1>
          <p>
            PostFlow gives approved customers one dashboard to create a campaign, validate platform rules,
            and schedule or publish content across their own connected social accounts.
          </p>
          <div className="hero-actions">
            <a href="/login" className="primary-btn">Login</a>
            <a href="/request-access" className="secondary-btn">Request access</a>
          </div>
          <div className="platform-tags">
            <span className="platform-pill">f</span>
            <span className="platform-pill">◎</span>
            <span className="platform-pill">Y</span>
            <span className="platform-pill">t</span>
            <span className="platform-pill">x</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Social publishing illustration">
          <div className="video-card">
            <div className="video-icon" />
            <span className="video-label">my-video.mp4</span>
          </div>
          <div className="network-arrows">
            <svg viewBox="0 0 700 420" role="img" aria-label="platform arrows">
              <path d="M280 155 L630 120 L630 160 L280 220 Z" fill="#f1592a" opacity="0.9" />
              <path d="M300 180 L630 210 L630 250 L300 250 Z" fill="#f1592a" opacity="0.9" />
              <path d="M270 208 L610 300 L610 340 L270 280 Z" fill="#f1592a" opacity="0.9" />
              <path d="M240 240 L560 373 L560 405 L240 310 Z" fill="#f1592a" opacity="0.9" />
              <path d="M220 280 L500 430 L500 462 L220 340 Z" fill="#f1592a" opacity="0.9" />
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
}
