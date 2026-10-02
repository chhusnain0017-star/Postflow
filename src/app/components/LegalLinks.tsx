import Link from "next/link";

export default function LegalLinks() {
  return (
    <nav className="legal-links" aria-label="Legal">
      <Link href="/terms">Terms of Service</Link>
      <Link href="/privacy">Privacy Policy</Link>
    </nav>
  );
}
