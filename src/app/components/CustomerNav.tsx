import Link from "next/link";
import type { UserRole } from "@/lib/store";

const customerLinks = [
  { href: "/dashboard", label: "Overview", active: "dashboard" },
  { href: "/calendar", label: "Calendar", active: "calendar" },
  { href: "/create-post", label: "Create post", active: "create-post" },
  { href: "/analytics", label: "Analytics", active: "analytics" },
  { href: "/library", label: "Content library", active: "library" },
  { href: "/integrations", label: "Integrations", active: "integrations" },
  { href: "/team", label: "Team", active: "team" },
  { href: "/history", label: "History", active: "history" },
  { href: "/settings", label: "Settings", active: "settings" },
];

export default function CustomerNav({ active, role }: { active: string; role: UserRole }) {
  const canApprove = role === "OWNER" || role === "ADMIN" || role === "APPROVER";

  return (
    <aside className="side-nav">
      <div className="brand">PostFlow</div>
      <nav>
        {customerLinks.slice(0, 3).map((link) => (
          <Link key={link.href} href={link.href} className={active === link.active ? "active" : undefined}>{link.label}</Link>
        ))}
        {canApprove && <Link href="/approvals" className={active === "approvals" ? "active" : undefined}>Approvals</Link>}
        {customerLinks.slice(3).map((link) => (
          <Link key={link.href} href={link.href} className={active === link.active ? "active" : undefined}>{link.label}</Link>
        ))}
      </nav>
      <form action="/api/auth/logout" method="POST" className="logout-form">
        <button type="submit">Logout</button>
      </form>
    </aside>
  );
}
