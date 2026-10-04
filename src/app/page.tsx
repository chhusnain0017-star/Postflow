import LegalLinks from "@/app/components/LegalLinks";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <Image src="/postflow-logo.png" alt="PostFlow logo" width={120} height={120} className="home-logo" priority />
          <h1>PostFlow<br />Upload once. Posts everywhere.</h1>
          <div className="hero-actions">
            <a href="/login" className="primary-btn">Login</a>
            <a href="/request-access" className="secondary-btn">Request access</a>
            <a href="/admin-login" className="secondary-btn admin-action">Admin login</a>
          </div>
          <p className="privacy-home-link">Privacy information is always available in our <Link href="/privacy">Privacy Policy</Link>, including how we handle Google account data.</p>
        </div>

        <div className="hero-visual" role="img" aria-label="A video file distributing to Facebook, Instagram, TikTok, Threads, YouTube, Pinterest, and X">
          <div className="video-card">
            <div className="video-icon"><span /></div>
            <span className="video-label">my-video.mp4</span>
          </div>

          <div className="network-arrows" aria-hidden="true">
            <svg viewBox="0 0 960 420" preserveAspectRatio="none">
              <defs>
                <marker id="platform-arrow" markerWidth="18" markerHeight="18" refX="15" refY="9" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M 0 0 L 18 9 L 0 18 z" />
                </marker>
              </defs>
              <line x1="254" y1="210" x2="632" y2="42" />
              <line x1="254" y1="210" x2="712" y2="96" />
              <line x1="254" y1="210" x2="792" y2="150" />
              <line x1="254" y1="210" x2="828" y2="204" />
              <line x1="254" y1="210" x2="792" y2="258" />
              <line x1="254" y1="210" x2="712" y2="312" />
              <line x1="254" y1="210" x2="632" y2="366" />
            </svg>
          </div>

          <div className="platform-stack" aria-label="Social platforms">
            <span className="platform-pill facebook" aria-label="Facebook">f</span>
            <span className="platform-pill instagram" aria-label="Instagram">◎</span>
            <span className="platform-pill tiktok" aria-label="TikTok">♪</span>
            <span className="platform-pill threads" aria-label="Threads">@</span>
            <span className="platform-pill youtube" aria-label="YouTube">▶</span>
            <span className="platform-pill pinterest" aria-label="Pinterest">P</span>
            <span className="platform-pill x" aria-label="X">X</span>
          </div>
        </div>
      </section>
      <p className="powered-by">Powered by <a href="https://taskflow.monster" target="_blank" rel="noreferrer">taskflow.monster</a></p>
      <LegalLinks />
    </main>
  );
}
