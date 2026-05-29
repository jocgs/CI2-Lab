"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_LINKS = [
  { href: "/",        label: "Inicio",   icon: "🏠" },
  { href: "/matches", label: "Partidos", icon: "⚽" },
  { href: "/groups",  label: "Grupos",   icon: "👥" },
  { href: "/ranking", label: "Ranking",  icon: "🏆" },
  { href: "/fantasy", label: "Fantasy",  icon: "⚡" },
  { href: "/tienda",  label: "Tienda",   icon: "🪙" },
  { href: "/news",    label: "Noticias", icon: "📰" },
];

/** Comprueba si el enlace está activo según el pathname actual. */
function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

/** Barra de navegación horizontal (escritorio) */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]")
            }
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra de navegación inferior (móvil) */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1 sm:hidden">
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors " +
              (active
                ? "text-[var(--brand-strong)]"
                : "text-[var(--muted)] hover:text-[var(--brand-strong)]")
            }
          >
            <span
              className={
                "flex h-7 w-7 items-center justify-center rounded-full text-base transition-colors " +
                (active ? "bg-[var(--brand-soft)]" : "")
              }
            >
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
