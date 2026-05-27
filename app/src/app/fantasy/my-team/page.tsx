import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import {
  getFantasyTeamByUserAndCompetition,
  getPlayersByCompetition,
  getNationalTeamsByCompetition,
} from "@/lib/fantasy-db";
import { getUserTournamentPicks } from "@/lib/picks-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { isTournamentLocked } from "@/lib/tournament-picks";
import { FantasyTeamDisplay } from "@/components/fantasy/FantasyTeamDisplay";
import { PredictionsForm } from "./PredictionsForm";
import { SpecialPicksForm } from "@/components/SpecialPicksForm";
import { EmptyState } from "@/components/ui";

export default async function MyFantasyTeamPage() {
  const user = await getCurrentUser();

  const [fantasyTeam, players, nationalTeams, myPicks] = await Promise.all([
    getFantasyTeamByUserAndCompetition(user.id, "world_cup_2026"),
    getPlayersByCompetition("world_cup_2026"),
    getNationalTeamsByCompetition("world_cup_2026"),
    getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id),
  ]);

  const picksLocked = isTournamentLocked(MOCK_TOURNAMENT);

  if (!fantasyTeam) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi equipo Fantasy</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026</p>
        </div>
        <EmptyState
          title="Aún no tienes equipo"
          description="Crea tu once titular, elige al capitán y luego haz tus predicciones del torneo. El Mundial no espera."
          action={
            <Link
              href="/fantasy/builder"
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi equipo Fantasy</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/fantasy/ranking"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            Ver ranking
          </Link>
        </div>
      </div>

      {/* Points summary */}
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
      />

      {/* ── Predicciones del torneo (sección unificada) ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-1 text-base font-semibold">🔮 Predicciones del torneo</h2>
        <p className="mb-5 text-xs text-[var(--muted)]">
          Predice el campeón, la sorpresa, la decepción y el MVP Fantasy — y elige tu tapada y
          favorita con cuotas de mercado. Todo suma puntos al final.
        </p>

        {/* Fantasy predictions: champion, surprise, disappointment, MVP */}
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
              team={fantasyTeam}
              nationalTeams={nationalTeams}
              squadPlayers={squadPlayers}
              competitionId="world_cup_2026"
            />
          );
        })()}

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs font-medium text-[var(--muted)]">Selecciones especiales con cuotas</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Special picks: revelation & disappointment by market odds */}
        <SpecialPicksForm
          teams={MOCK_TOURNAMENT_TEAMS}
          existingPicks={myPicks}
          tournamentId={MOCK_TOURNAMENT.id}
          isLocked={picksLocked}
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
