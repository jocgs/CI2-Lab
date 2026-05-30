import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db";
import {
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyLeagueById,
  getLeaguesByUserId,
  getPlayersByCompetition,
  getNationalTeamsByCompetition,
} from "@/lib/fantasy-db";
import { getUserTournamentPicks } from "@/lib/picks-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { isTournamentLocked } from "@/lib/tournament-picks";
import { isFantasyCompetitionLocked } from "@/lib/fantasy-lock";
import { bolaDeCristalHref, fantasyReturnHref } from "@/lib/fantasy-routes";
import { PredictionsForm } from "./PredictionsForm";
import { EmptyState } from "@/components/ui";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function BolaDeCristalPage({ searchParams }: Props) {
  const params = await searchParams;
  const leagueId =
    typeof params.league === "string" && params.league.length > 0
      ? params.league
      : undefined;
  const user = await getCurrentUser();

  const league = leagueId ? await getFantasyLeagueById(leagueId) : null;
  if (leagueId && (!league || !league.memberIds.includes(user.id))) {
    redirect("/fantasy/leagues");
  }

  const isLeagueView = Boolean(leagueId && league);

  const [fantasyTeam, players, nationalTeams, myPicks, myLeagues] =
    await Promise.all([
      isLeagueView
        ? getFantasyTeamForLeague(user.id, COMPETITION_ID, leagueId!)
        : getGlobalFantasyTeam(user.id, COMPETITION_ID),
      getPlayersByCompetition(COMPETITION_ID),
      getNationalTeamsByCompetition(COMPETITION_ID),
      getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id),
      getLeaguesByUserId(user.id),
    ]);

  const picksLocked =
    isTournamentLocked(MOCK_TOURNAMENT) || isFantasyCompetitionLocked();

  const pageTitle = isLeagueView
    ? `Bola de cristal · ${league!.name}`
    : "Bola de cristal";
  if (!fantasyTeam) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb backHref={isLeagueView ? "/fantasy/leagues" : "/fantasy"} backLabel={isLeagueView ? "Ligas" : "Fantasy"} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026</p>
        </div>
        <EmptyState
          title={isLeagueView ? "Primero crea tu equipo de liga" : "Primero crea tu equipo Fantasy"}
          description={
            isLeagueView
              ? "Las predicciones de liga (campeón, MVP y decepción) requieren tener un once en esa liga."
              : "Necesitas un once global para elegir el MVP desde tu plantilla y el resto de predicciones."
          }
          action={
            <Link
              href={
                isLeagueView
                  ? `/fantasy/builder?league=${leagueId}`
                  : "/fantasy/builder"
              }
              className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Crear equipo →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-[var(--brand-strong)]">🔮 Bola de cristal</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{pageTitle}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isLeagueView
            ? "Campeón y decepción para esta liga. El resto de premios están en el modo global."
            : "Campeón, revelación, decepción, Balón de oro, Bota de oro, Guante de oro y más premios del Mundial 2026."}
        </p>
      </div>

      <PredictionsForm
        fantasyTeam={fantasyTeam}
        allPlayers={players}
        nationalTeams={nationalTeams}
        tournamentTeams={MOCK_TOURNAMENT_TEAMS}
        existingPicks={myPicks}
        competitionId={COMPETITION_ID}
        tournamentId={MOCK_TOURNAMENT.id}
        leagueId={leagueId ?? null}
        picksLocked={picksLocked}
        showGlobalAwards={!isLeagueView}
        returnHref={fantasyReturnHref(leagueId ?? null)}
        returnLabel={isLeagueView ? `Mi equipo · ${league!.name}` : "Mi equipo"}
      />

      {!isLeagueView && myLeagues.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Predicciones por liga</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Cada liga tiene sus propias predicciones de campeón, MVP y decepción.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {myLeagues.map((l) => (
              <li key={l.id}>
                <Link
                  href={bolaDeCristalHref(l.id)}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium hover:bg-[var(--background)]"
                >
                  <span>{l.name}</span>
                  <span className="text-[var(--muted)]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Breadcrumb({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <nav className="text-sm text-[var(--muted)]">
      <Link href="/fantasy" className="hover:text-[var(--fg)]">
        Fantasy
      </Link>
      <span className="mx-1.5">/</span>
      <Link href={backHref} className="hover:text-[var(--fg)]">
        {backLabel}
      </Link>
      <span className="mx-1.5">/</span>
      <span className="text-[var(--fg)]">Bola de cristal</span>
    </nav>
  );
}
