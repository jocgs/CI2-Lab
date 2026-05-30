import type {
  FantasyTeam,
  FantasyPlayer,
  FantasyNationalTeam,
} from "@/types/fantasy";
import { resolveFormationFromEleven } from "@/lib/fantasy-formations";
import { FantasySquadPitchPreview } from "@/components/fantasy/FantasySquadPitchPreview";

interface FantasyTeamDisplayProps {
  fantasyTeam: FantasyTeam;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
}

export function FantasyTeamDisplay({
  fantasyTeam,
  players,
  nationalTeams,
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
    </div>
  );
}
