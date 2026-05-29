import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { USE_MOCKS } from "@/lib/runtime";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopNav, MobileNav } from "./NavLinks";

export async function Header({ initialTheme }: { initialTheme: "light" | "dark" }) {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-white text-sm font-bold shadow-sm"
          >
            T
          </span>
          <span className="text-lg font-semibold tracking-tight">TikiTaka</span>
        </Link>

        {/* Nav escritorio — componente cliente con pathname activo */}
        <DesktopNav />

        {/* Usuario + ajustes */}
        <div className="flex items-center gap-2">
          <ThemeToggle initialTheme={initialTheme} />
          {user && (
            <>
              {/* Saldo de monedas */}
              <Link
                href="/tienda"
                className="inline-flex h-9 min-w-9 flex-col items-center justify-center rounded-full border border-amber-300/60 bg-amber-50 px-2 text-amber-700 transition hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
                title="Ir a la tienda"
              >
                <span className="text-[10px] leading-none" aria-hidden>
                  🪙
                </span>
                <span className="text-[11px] font-bold leading-none tabular-nums">
                  {(user as { coins?: number }).coins ?? 0}
                </span>
              </Link>
              <Link
                href="/profile"
                title={user.displayName}
                className="block h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--brand-soft)] transition-opacity hover:opacity-80"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[var(--brand)] text-xs font-bold text-white">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              {!USE_MOCKS && <SignOutButton />}
            </>
          )}
        </div>
      </div>

      {/* Nav inferior móvil — componente cliente con pathname activo */}
      <MobileNav />
    </header>
  );
}
