import Image from "next/image";
import Link from "next/link";
import type { UserRole } from "../../../tests/store";
import { requireSignedInUser } from "@/lib/access";

const customerLinks = [
  { href: "/dashboard", label: "Home", active: "dashboard", icon: "⌂" },
  { href: "/dashboard", label: "Dashboard", active: "dashboard", icon: "▦" },
  { href: "/library", label: "Documents", active: "library", icon: "▤" },
  { href: "/history", label: "Messages", active: "history", icon: "✉" },
  { href: "/team", label: "Community", active: "team", icon: "♧" },
  { href: "/create-post", label: "Products", active: "create-post", icon: "◇" },
  { href: "/integrations", label: "Resources", active: "integrations", icon: "◎" },
  { href: "/settings", label: "Settings", active: "settings", icon: "⚙" },
  { href: "/calendar", label: "Calendar", active: "calendar", icon: "▦" },
  { href: "/analytics", label: "Analytics", active: "analytics", icon: "↗" },
];

export default async function CustomerNav({ active, role }: { active: string; role: UserRole }) {
  const user = await requireSignedInUser();

  return (
    <aside className="side-nav">
      <Link href="/dashboard" className="brand brand-image">
        <Image src="/postflow-logo-green.png" alt="PostFlow" width={42} height={42} priority />
        <span>PostFlow</span>
      </Link>
      <nav aria-label="Main navigation">
        {customerLinks.map((link) => (
          <Link key={`${link.label}-${link.href}`} href={link.href} className={active === link.active ? "active" : undefined}>
            <span className="side-nav-icon" aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        {(role === "OWNER" || role === "ADMIN" || role === "APPROVER") && (
          <Link href="/approvals" className={active === "approvals" ? "active" : undefined}>
            <span className="side-nav-icon" aria-hidden="true">✓</span>
            Approvals
          </Link>
        )}
      </nav>
      <div className="side-nav-account">
        <Link href="/settings" className="side-account-settings" aria-label="Settings">⚙</Link>
        <Image
          src={user.avatarUrl || "/postflow-logo-green.png"}
          alt=""
          width={40}
          height={40}
          className="account-avatar"
          unoptimized
        />
        <div className="account-copy">
          <strong>{user.name}</strong>
          <span><i className="online-indicator" />Online</span>
          <small>{user.email}</small>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="account-logout" aria-label="Log out">↗</button>
        </form>
      </div>
    </aside>
  );
}
