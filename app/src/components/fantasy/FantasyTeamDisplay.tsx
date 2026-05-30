import type {
  FantasyTeam,
  FantasyPlayer,
  FantasyNationalTeam,
} from "@/types/fantasy";
import { getFormationLabel, resolveFormationFromEleven } from "@/lib/fantasy-formations";
import { FantasySquadPitchPreview } from "@/components/fantasy/FantasySquadPitchPreview";
import type { UserTournamentPicks } from "@/types/picks";
import { BolaDeCristalAwardsSummary } from "@/components/fantasy/BolaDeCristalAwardsSummary";

interface FantasyTeamDisplayProps {
  fantasyTeam: FantasyTeam;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  tournamentPicks?: UserTournamentPicks | null;
  /** Vista de liga: resumen reducido de Bola de cristal. */
  leagueView?: boolean;
}

export function FantasyTeamDisplay({
  fantasyTeam,
  players,
  nationalTeams,
  tournamentPicks = null,
  leagueView = false,
}: FantasyTeamDisplayProps) {
  const pm = new Map(players.map((p) => [p.id, p]));
  const { startingEleven: se, bench, captainId } = fantasyTeam;
  const formation = resolveFormationFromEleven(se);

  const missingIds = [
    se.goalkeeperId,
    ...se.defenderIds,
    ...se.midfielderIds,
    ...se.forwardIds,
    bench.goalkeeperId,
    bench.defenderId,
    bench.midfielderId,
    bench.forwardId,
  ].filter((id) => id && !pm.has(id));

  return (
    <div className="flex flex-col gap-3">
      {missingIds.length > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Algunos jugadores de esta plantilla ya no están en el catálogo ({missingIds.length}).
          Edita el equipo para actualizarlos.
        </p>
      )}

      <div className="relative">
        <FantasySquadPitchPreview
          formation={formation}
          teamName={fantasyTeam.teamName}
          goalkeeperId={se.goalkeeperId}
          defenderIds={[...se.defenderIds]}
          midfielderIds={[...se.midfielderIds]}
          forwardIds={[...se.forwardIds]}
          bench={bench}
          captainId={captainId}
          players={players}
          nationalTeams={nationalTeams}
        />
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          <span className="rounded-lg bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {fantasyTeam.totalPoints} pts
          </span>
          {fantasyTeam.locked && (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
              🔒 Bloqueado
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Bola de cristal
        </p>
        <BolaDeCristalAwardsSummary
          fantasyTeam={fantasyTeam}
          picks={tournamentPicks}
          players={players}
          nationalTeams={nationalTeams}
          leagueView={leagueView}
        />
        <p className="mt-3 text-[10px] text-[var(--muted)]">
          Formación registrada: {getFormationLabel(formation)}
        </p>
      </div>
    </div>
  );
}
