import type { FantasyNationalTeam, FantasyPlayer, FantasyTeam } from "@/types/fantasy";
import type { UserTournamentPicks } from "@/types/picks";
import {
  PredictionSummaryMvpTile,
  PredictionSummaryNationalTile,
} from "@/components/fantasy/PredictionSummaryTile";

interface BolaDeCristalAwardsSummaryProps {
  fantasyTeam: FantasyTeam;
  picks: UserTournamentPicks | null;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  /** Vista de liga: solo campeón y decepción. */
  leagueView?: boolean;
}

export function BolaDeCristalAwardsSummary({
  fantasyTeam,
  picks,
  players,
  nationalTeams,
  leagueView = false,
}: BolaDeCristalAwardsSummaryProps) {
  const pm = new Map(players.map((p) => [p.id, p]));
  const ntMap = new Map(nationalTeams.map((t) => [t.id, t]));

  const ballonPlayer =
    (picks?.ballonDOrPlayerId && pm.get(picks.ballonDOrPlayerId)) ||
    (fantasyTeam.tournamentMvpPlayerId && pm.get(fantasyTeam.tournamentMvpPlayerId)) ||
    undefined;

  if (leagueView) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <PredictionSummaryNationalTile
          label="Campeona"
          team={ntMap.get(fantasyTeam.championTeamId ?? "") ?? null}
          teamId={fantasyTeam.championTeamId}
        />
        <PredictionSummaryNationalTile
          label="Decepción"
          team={ntMap.get(fantasyTeam.disappointmentTeamId ?? "") ?? null}
          teamId={fantasyTeam.disappointmentTeamId}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <PredictionSummaryNationalTile
        label="Campeona"
        team={ntMap.get(fantasyTeam.championTeamId ?? "") ?? null}
        teamId={fantasyTeam.championTeamId}
      />
      <PredictionSummaryNationalTile
        label="Revelación"
        team={ntMap.get(picks?.revelationTeamId ?? "") ?? null}
        teamId={picks?.revelationTeamId ?? undefined}
      />
      <PredictionSummaryNationalTile
        label="Decepción"
        team={ntMap.get(fantasyTeam.disappointmentTeamId ?? "") ?? null}
        teamId={fantasyTeam.disappointmentTeamId}
      />
      <PredictionSummaryMvpTile label="Balón de oro" player={ballonPlayer} />
      <PredictionSummaryMvpTile
        label="Bota de oro"
        player={picks?.goldenBootPlayerId ? pm.get(picks.goldenBootPlayerId) : undefined}
      />
      <PredictionSummaryMvpTile
        label="Guante de oro"
        player={picks?.goldenGlovePlayerId ? pm.get(picks.goldenGlovePlayerId) : undefined}
      />
      <PredictionSummaryMvpTile
        label="Mejor joven"
        player={picks?.bestYoungPlayerId ? pm.get(picks.bestYoungPlayerId) : undefined}
      />
      <PredictionSummaryMvpTile
        label="Máx. asist."
        player={picks?.topAssistPlayerId ? pm.get(picks.topAssistPlayerId) : undefined}
      />
      <PredictionSummaryNationalTile
        label="Mejor gol"
        team={ntMap.get(picks?.bestGoalTeamId ?? "") ?? null}
        teamId={picks?.bestGoalTeamId ?? undefined}
      />
      <PredictionSummaryNationalTile
        label="Mejor en grupos"
        team={ntMap.get(picks?.bestGroupStageTeamId ?? "") ?? null}
        teamId={picks?.bestGroupStageTeamId ?? undefined}
      />
      <PredictionSummaryNationalTile
        label="Peor en grupos"
        team={ntMap.get(picks?.worstGroupStageTeamId ?? "") ?? null}
        teamId={picks?.worstGroupStageTeamId ?? undefined}
      />
      <PredictionSummaryNationalTile
        label="Fuera UEFA/CONMEBOL"
        team={ntMap.get(picks?.bestNonUefaConmebolTeamId ?? "") ?? null}
        teamId={picks?.bestNonUefaConmebolTeamId ?? undefined}
      />
    </div>
  );
}
