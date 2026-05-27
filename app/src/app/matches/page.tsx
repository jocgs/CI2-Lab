import Link from "next/link";
import {
  getBetForUserAndMatch,
  getCurrentUser,
  getFinishedMatches,
  getUpcomingMatches,
} from "@/lib/db";
import { MatchCard } from "@/components/MatchCard";
import { EmptyState } from "@/components/ui";
import { clsx } from "@/lib/utils";

type Tab = "upcoming" | "finished";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab = params.tab === "finished" ? "finished" : "upcoming";

  const [user, matches] = await Promise.all([
    getCurrentUser(),
    tab === "upcoming" ? getUpcomingMatches() : getFinishedMatches().then((m) => m.slice().reverse()),
  ]);

  const matchesWithBets = await Promise.all(
    matches.map(async (match) => ({
      match,
      userBet: await getBetForUserAndMatch(user.id, match.id),
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Partidos</h1>
        <p className="text-sm text-[var(--muted)]">Haz tu porra (1, X o 2) antes del pitido inicial.</p>
      </header>

      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-sm w-fit">
        <TabLink href="/matches?tab=upcoming" active={tab === "upcoming"}>
          Próximos
        </TabLink>
        <TabLink href="/matches?tab=finished" active={tab === "finished"}>
          Finalizados
        </TabLink>
      </div>

      {matchesWithBets.length === 0 ? (
        <EmptyState title="No hay partidos para mostrar" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matchesWithBets.map(({ match, userBet }) => (
            <MatchCard key={match.id} match={match} userBet={userBet} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-full px-4 py-1.5 font-medium transition-colors",
        active
          ? "bg-[var(--brand)] text-white shadow-sm"
          : "text-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </Link>
  );
}
