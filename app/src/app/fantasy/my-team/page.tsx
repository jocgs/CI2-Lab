import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db";
import {
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyLeagueById,
  getPlayersByCompetition,
  getNationalTeamsByCompetition,
} from "@/lib/fantasy-db";
import { getUserTournamentPicks } from "@/lib/picks-db";
import { MOCK_TOURNAMENT } from "@/lib/mocks/tournament-teams";
import {
  isFantasyTeamEditable,
  getFantasyLockAt,
} from "@/lib/fantasy-lock";
import { FantasyTeamDisplay } from "@/components/fantasy/FantasyTeamDisplay";
import { BolaDeCristalCta } from "@/components/fantasy/BolaDeCristalCta";
import {
  isBolaDeCristalGlobalComplete,
  isBolaDeCristalLeagueComplete,
} from "@/lib/bola-de-cristal";
import { EmptyState } from "@/components/ui";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function MyFantasyTeamPage({ searchParams }: Props) {
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

  const [fantasyTeam, players, nationalTeams, myPicks] = await Promise.all([
    isLeagueView
      ? getFantasyTeamForLeague(user.id, COMPETITION_ID, leagueId!)
      : getGlobalFantasyTeam(user.id, COMPETITION_ID),
    getPlayersByCompetition(COMPETITION_ID),
    getNationalTeamsByCompetition(COMPETITION_ID),
    getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id),
  ]);

  const canEditSquad = fantasyTeam ? isFantasyTeamEditable(fantasyTeam) : false;
  const pageTitle = isLeagueView ? `Mi equipo · ${league!.name}` : "Mi equipo · Fantasy global";
  const builderHref = isLeagueView
    ? `/fantasy/builder?league=${leagueId}`
    : "/fantasy/builder";
  const editSquadHref = isLeagueView
    ? `/fantasy/builder?league=${leagueId}&edit=1`
    : "/fantasy/builder?edit=1";
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
              : "Crea tu once titular y elige al capitán. Las predicciones del torneo están en Bola de cristal."
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
          {canEditSquad && (
            <Link
              href={editSquadHref}
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Editar plantilla
            </Link>
          )}
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

      {canEditSquad && (
        <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          Puedes editar la plantilla hasta el{" "}
          <strong>
            {getFantasyLockAt().toLocaleString("es-ES", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </strong>{" "}
          (inicio del torneo).
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Puntos totales" value={fantasyTeam.totalPoints} />
        <StatCard
          label="Estado"
          value={canEditSquad ? "✏️ Editable" : "🔒 Bloqueado"}
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
        tournamentPicks={myPicks}
        leagueView={isLeagueView}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <BolaDeCristalCta
          leagueId={leagueId ?? null}
          hasAnyPrediction={
            isLeagueView
              ? isBolaDeCristalLeagueComplete(fantasyTeam)
              : isBolaDeCristalGlobalComplete(fantasyTeam, myPicks)
          }
        />
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
