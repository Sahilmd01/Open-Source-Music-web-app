"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LIBRARY_NAV, MY_MUSIC_NAV, type NavLink } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { ListenifyLogo } from "@/components/icons";

function NavGroup({
  title,
  links,
  pathname,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="sidebar__title">{title}</h2>
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn("nav-item", active && "is-active")}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const open = useUiStore((s) => s.sidebarOpen);
  const close = useUiStore((s) => s.closeSidebar);
  const user = useUiStore((s) => s.user);

  const isAdmin = user?.role === "admin";
  const visibleMyMusicNav = MY_MUSIC_NAV.filter(
    (item) => item.href !== "/control" || isAdmin
  );

  return (
    <>
      <div className={cn("sidebar-scrim", open && "is-open")} onClick={close} aria-hidden="true" suppressHydrationWarning />
      <aside className={cn("sidebar", open && "is-open")} suppressHydrationWarning>
        <div className="sidebar__brand">
          <Link href="/" className="sidebar__logo-link" onClick={close}>
            <ListenifyLogo width={28} height={28} />
            <span className="sidebar__brand-name">Listenify</span>
          </Link>
        </div>
        <NavGroup title="Library" links={LIBRARY_NAV} pathname={pathname} onNavigate={close} />
        <NavGroup title="My music" links={visibleMyMusicNav} pathname={pathname} onNavigate={close} />

        <div style={{ marginTop: "auto", paddingTop: "var(--space-4)", display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/about"
            onClick={close}
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textDecoration: "none",
              opacity: 0.7,
              transition: "opacity var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            About
          </Link>
          <span style={{ fontSize: "10px", color: "var(--border-default)" }}>•</span>
          <Link
            href="/terms"
            onClick={close}
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textDecoration: "none",
              opacity: 0.7,
              transition: "opacity var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            Terms &amp; Policies
          </Link>
        </div>
      </aside>
    </>
  );
}
