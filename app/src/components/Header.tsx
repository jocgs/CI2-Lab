import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { USE_MOCKS } from "@/lib/runtime";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/groups", label: "Grupos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/fantasy", label: "Fantasy" },
  { href: "/profile", label: "Perfil" },
];

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-white text-sm font-bold shadow-sm"
          >
            P
          </span>
          <span className="text-lg font-semibold tracking-tight">Porrify</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <ThemeToggle />
          {user && (
            <>
              <span className="hidden text-[var(--muted)] sm:block">Hola,</span>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-medium text-[var(--brand-strong)]">
                {user.displayName}
              </span>
              {!USE_MOCKS && <SignOutButton />}
            </>
          )}
        </div>
      </div>

      {/* Nav inferior solo en móvil */}
      <nav className="flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-2 py-1 text-[var(--muted)] hover:text-[var(--brand-strong)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
