export default function Home() {
  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <h1>Upload once.<br />Posts everywhere.</h1>
          <div className="hero-actions">
            <a href="/login" className="primary-btn">Login</a>
            <a href="/request-access" className="secondary-btn">Request access</a>
            <a href="/admin-login" className="secondary-btn admin-action">Admin login</a>
          </div>
        </div>

        <div className="hero-visual" role="img" aria-label="A video file distributing to Facebook, Instagram, TikTok, Threads, YouTube, Pinterest, and X">
          <div className="video-card">
            <div className="video-icon"><span /></div>
            <span className="video-label">my-video.mp4</span>
          </div>

          <div className="network-arrows" aria-hidden="true">
            <div className="arrow arrow-1" />
            <div className="arrow arrow-2" />
            <div className="arrow arrow-3" />
            <div className="arrow arrow-4" />
            <div className="arrow arrow-5" />
            <div className="arrow arrow-6" />
            <div className="arrow arrow-7" />
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
    </main>
  );
}
