import Link from "next/link";
import { SectionHero } from "@/components/SectionHero";
import { HERO_ASSETS } from "@/lib/constants/assets";
import {
  getBetForUserAndMatch,
  getCompetitions,
  getCurrentUser,
  getFinishedMatches,
  getTeams,
  getUpcomingMatches,
} from "@/lib/db";
import { MatchCard } from "@/components/MatchCard";
import { MatchFilters } from "@/components/MatchFilters";
import { SyncBanner } from "@/components/SyncBanner";
import { EmptyState } from "@/components/ui";
import { getMatchSyncStatus, WORLD_CUP_COMPETITION_ID } from "@/lib/match-sync";
import { filterDisplayMatches } from "@/lib/match-display";
import { clsx, computeTeamForms } from "@/lib/utils";

type Tab = "upcoming" | "finished";

function buildMatchesQuery(params: {
  tab: Tab;
  competition?: string;
  team?: string;
}): string {
  const q = new URLSearchParams();
  q.set("tab", params.tab);
  if (params.competition !== undefined) q.set("competition", params.competition);
  if (params.team) q.set("team", params.team);
  return q.toString();
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; competition?: string; team?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab = params.tab === "finished" ? "finished" : "upcoming";

  const [user, finishedMatches, competitions, teams, syncStatus] = await Promise.all([
    getCurrentUser(),
    getFinishedMatches(),
    getCompetitions(),
    getTeams(),
    getMatchSyncStatus(),
  ]);

  const competitionInUrl = params.competition !== undefined;
  const selectedCompetition = competitionInUrl
    ? params.competition
    : syncStatus.enabled
      ? WORLD_CUP_COMPETITION_ID
      : "";
  const selectedTeam = params.team ?? "";

  const rawMatches =
    tab === "upcoming"
      ? await getUpcomingMatches()
      : finishedMatches.slice().reverse();

  const allMatches =
    tab === "upcoming" ? filterDisplayMatches(rawMatches) : rawMatches;

  const teamForms = computeTeamForms(finishedMatches);

  // Filtrar por competición o equipo
  const matches = allMatches.filter((match) => {
    if (selectedCompetition) return match.competitionId === selectedCompetition;
    if (selectedTeam) return match.homeTeamId === selectedTeam || match.awayTeamId === selectedTeam;
    return true;
  });

  const matchesWithBets = await Promise.all(
    matches.map(async (match) => ({
      match,
      userBet: await getBetForUserAndMatch(user.id, match.id),
    }))
  );

  // Solo equipos y competiciones que aparecen en los partidos del tab activo
  const activeTeamIds = new Set(allMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
  const activeCompIds = new Set(allMatches.map((m) => m.competitionId));
  const sortedTeams = teams
    .filter((t) => activeTeamIds.has(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sortedCompetitions = competitions
    .filter((c) => activeCompIds.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        title="Partidos"
        subtitle="Haz tu porra antes del kickoff"
        imageSrc={HERO_ASSETS.partidos}
      />

      {syncStatus.enabled && (
        <SyncBanner
          syncedAt={syncStatus.syncedAt}
          matchCount={syncStatus.matchCount}
          finishedCount={syncStatus.finishedCount}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-sm w-fit">
          <TabLink href={`/matches?${buildMatchesQuery({ tab: "upcoming", competition: competitionInUrl ? selectedCompetition : undefined, team: selectedTeam || undefined })}`} active={tab === "upcoming"}>
            Próximos
          </TabLink>
          <TabLink href={`/matches?${buildMatchesQuery({ tab: "finished", competition: competitionInUrl ? selectedCompetition : undefined, team: selectedTeam || undefined })}`} active={tab === "finished"}>
            Finalizados
          </TabLink>
        </div>

        <MatchFilters
          competitions={sortedCompetitions}
          teams={sortedTeams}
          selectedCompetition={selectedCompetition}
          selectedTeam={selectedTeam}
          tab={tab}
          competitionInUrl={competitionInUrl}
        />
      </div>

      {selectedCompetition || selectedTeam ? (
        <p className="text-xs text-[var(--muted)]">
          {matchesWithBets.length} partido{matchesWithBets.length !== 1 ? "s" : ""} encontrado{matchesWithBets.length !== 1 ? "s" : ""}
        </p>
      ) : null}

      {matchesWithBets.length === 0 ? (
        <EmptyState title="No hay partidos para mostrar" description="Prueba cambiando los filtros o la pestaña." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matchesWithBets.map(({ match, userBet }) => (
            <MatchCard
              key={match.id}
              match={match}
              userBet={userBet}
              homeForm={teamForms.get(match.homeTeamId)}
              awayForm={teamForms.get(match.awayTeamId)}
            />
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
