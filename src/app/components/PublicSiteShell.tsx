import Image from "next/image";
import Link from "next/link";

export default function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <header className="public-header">
        <Link href="/" className="public-brand" aria-label="PostFlow home">
          <Image src="/postflow-logo-green.png" alt="" width={38} height={38} />
          <span>PostFlow</span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/plans">Plans</Link>
        </nav>
        <Link href="/login" className="public-header-cta">Sign in <span aria-hidden="true">↗</span></Link>
      </header>
      {children}
      <footer className="public-footer">
        <div className="public-footer-main">
          <div className="public-footer-brand">
            <Link href="/" className="public-brand">
              <Image src="/postflow-logo-green.png" alt="" width={34} height={34} />
              <span>PostFlow</span>
            </Link>
            <p>A workspace for planning, reviewing, and managing social content.</p>
          </div>
          <div className="public-footer-column">
            <strong>Explore</strong>
            <Link href="/features">Features</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/plans">Plans and access</Link>
          </div>
          <div className="public-footer-column">
            <strong>Information</strong>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/delete-account">Delete account</Link>
          </div>
          <div className="public-footer-column">
            <strong>Get in touch</strong>
            <a href="mailto:chyt84709@gmail.com">Contact PostFlow</a>
            <Link href="/login">Workspace sign in</Link>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} PostFlow. All rights reserved.</span>
          <span>Powered by <a href="https://taskflow.monster" target="_blank" rel="noreferrer">TaskFlow.monster</a></span>
        </div>
      </footer>
    </div>
  );
}
