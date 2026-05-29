import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/db";
import {
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyLeagueById,
  getPlayersByCompetition,
  getNationalTeamsByCompetition,
} from "@/lib/fantasy-db";
import { getUserTournamentPicks } from "@/lib/picks-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { isTournamentLocked } from "@/lib/tournament-picks";
import { FantasyTeamDisplay } from "@/components/fantasy/FantasyTeamDisplay";
import { PredictionsForm } from "./PredictionsForm";
import { EmptyState } from "@/components/ui";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function MyFantasyTeamPage({ searchParams }: Props) {
  const { league: leagueId } = await searchParams;
  const user = await getCurrentUser();

  const league = leagueId ? await getFantasyLeagueById(leagueId) : null;
  if (leagueId && (!league || !league.memberIds.includes(user.id))) {
    notFound();
  }

  const isLeagueView = Boolean(leagueId && league);

  const [fantasyTeam, players, nationalTeams, myPicks] = await Promise.all([
    isLeagueView
      ? getFantasyTeamForLeague(user.id, COMPETITION_ID, leagueId!)
      : getGlobalFantasyTeam(user.id, COMPETITION_ID),
    getPlayersByCompetition(COMPETITION_ID),
    getNationalTeamsByCompetition(COMPETITION_ID),
    getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id),
  ]);

  const picksLocked = isTournamentLocked(MOCK_TOURNAMENT);
  const pageTitle = isLeagueView ? `Mi equipo · ${league!.name}` : "Mi equipo · Fantasy global";
  const builderHref = isLeagueView
    ? `/fantasy/builder?league=${leagueId}`
    : "/fantasy/builder";
  const rankingHref = isLeagueView
    ? `/fantasy/leagues/${leagueId}`
    : "/fantasy/ranking";

  if (!fantasyTeam) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026</p>
        </div>
        <EmptyState
          title={isLeagueView ? "Sin equipo en esta liga" : "Aún no tienes equipo global"}
          description={
            isLeagueView
              ? "Crea un once solo para esta liga. Puedes tener plantillas distintas en cada liga y en el ranking global."
              : "Crea tu once titular, elige al capitán y haz tus predicciones (incluida la revelación)."
          }
          action={
            <Link
              href={builderHref}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={rankingHref}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            {isLeagueView ? "Ranking de la liga" : "Ranking global"}
          </Link>
          {!isLeagueView && (
            <Link
              href="/fantasy/leagues"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              Mis ligas
            </Link>
          )}
        </div>
      </div>

      {!isLeagueView && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)]">
          Este es tu equipo del <strong>ranking global</strong>. En cada liga de amigos puedes
          montar otro once distinto desde la página de la liga.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Puntos totales" value={fantasyTeam.totalPoints} />
        <StatCard
          label="Estado"
          value={fantasyTeam.locked ? "🔒 Bloqueado" : "✏️ Editable"}
          isText
        />
        <StatCard
          label="Creado"
          value={new Date(fantasyTeam.createdAt).toLocaleDateString("es-ES")}
          isText
        />
        <StatCard
          label="Actualizado"
          value={new Date(fantasyTeam.updatedAt).toLocaleDateString("es-ES")}
          isText
        />
      </div>

      <FantasyTeamDisplay
        fantasyTeam={fantasyTeam}
        players={players}
        nationalTeams={nationalTeams}
        revelationTeamName={
          !isLeagueView
            ? MOCK_TOURNAMENT_TEAMS.find((t) => t.id === (myPicks?.revelationTeamId ?? ""))?.name
            : undefined
        }
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-1 text-base font-semibold">🔮 Predicciones del torneo</h2>
        <p className="mb-5 text-xs text-[var(--muted)]">
          {isLeagueView
            ? "Campeón, MVP y decepción para esta liga. La revelación se gestiona en tu equipo global."
            : "Campeón, MVP, decepción y selección revelación (tapada)."}
        </p>
        {(() => {
          const { startingEleven: se, bench: b } = fantasyTeam;
          const squadIds = new Set([
            se.goalkeeperId,
            ...se.defenderIds,
            ...se.midfielderIds,
            ...se.forwardIds,
            b.goalkeeperId,
            b.defenderId,
            b.midfielderId,
            b.forwardId,
          ]);
          const squadPlayers = players.filter((p) => squadIds.has(p.id));
          return (
            <PredictionsForm
              fantasyTeam={fantasyTeam}
              nationalTeams={nationalTeams}
              squadPlayers={squadPlayers}
              tournamentTeams={MOCK_TOURNAMENT_TEAMS}
              existingPicks={myPicks}
              competitionId={COMPETITION_ID}
              tournamentId={MOCK_TOURNAMENT.id}
              leagueId={leagueId ?? null}
              picksLocked={picksLocked}
              showRevelation={!isLeagueView}
            />
          );
        })()}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p
        className={
          isText
            ? "mt-1 text-sm font-medium"
            : "mt-1 text-2xl font-semibold tabular-nums text-[var(--brand-strong)]"
        }
      >
        {value}
      </p>
    </div>
  );
}
