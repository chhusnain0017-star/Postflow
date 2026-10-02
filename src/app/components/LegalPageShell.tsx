import Link from "next/link";
import LegalLinks from "@/app/components/LegalLinks";

export default function LegalPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="legal-shell">
      <header className="legal-header">
        <Link href="/" className="legal-brand">PostFlow</Link>
        <LegalLinks />
        <Link href="/" className="text-link">Home</Link>
      </header>
      <article className="legal-document">
        <p className="eyebrow">PostFlow · Effective October 2, 2026</p>
        <h1>{title}</h1>
        {children}
      </article>
      <p className="powered-by">Powered by <a href="https://taskflow.monster" target="_blank" rel="noreferrer">taskflow.monster</a></p>
    </main>
  );
}
