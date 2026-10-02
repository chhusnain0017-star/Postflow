import { seedDemoData } from "@/lib/store";

export default function Home() {
  seedDemoData();

  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <h1>Upload once.<br />Posts everywhere.</h1>
          <div className="hero-actions">
            <a href="/login" className="primary-btn">Login</a>
            <a href="/request-access" className="secondary-btn">Request access</a>
            <a href="/login" className="secondary-btn admin-action" data-admin="true">Admin login</a>
          </div>
        </div>

        <div className="hero-visual" aria-label="Social publishing illustration">
          <div className="video-card">
            <div className="video-icon" />
            <span className="video-label">my-video.mp4</span>
          </div>

          <div className="network-arrows" aria-hidden="true">
            <div className="arrow arrow-1" />
            <div className="arrow arrow-2" />
            <div className="arrow arrow-3" />
            <div className="arrow arrow-4" />
            <div className="arrow arrow-5" />
            <div className="arrow arrow-6" />
          </div>

          <div className="platform-stack" aria-label="Social platforms">
            <span className="platform-pill facebook">f</span>
            <span className="platform-pill instagram">◎</span>
            <span className="platform-pill tiktok">♪</span>
            <span className="platform-pill x">X</span>
            <span className="platform-pill pinterest">P</span>
            <span className="platform-pill youtube">▶</span>
          </div>
        </div>
      </section>
    </main>
  );
}
