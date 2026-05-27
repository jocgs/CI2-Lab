import type {
  FantasyPlayerMatchStats,
  Position,
  FantasyTeam,
  FantasyPlayer,
  FantasyCompetitionBonuses,
  FantasyTeamPointsBreakdown,
} from "@/types/fantasy";

export function calculatePlayerFantasyPoints(
  stats: FantasyPlayerMatchStats,
  position: Position,
): number {
  let pts = 0;

  if (stats.minutesPlayed > 0) pts += 1;
  if (stats.mvp) pts += 4;

  pts -= stats.yellowCards * 1;
  pts -= stats.redCards * 3;
  pts -= stats.penaltyMissed * 3;

  if (position === "GK") {
    pts += stats.penaltySaved * 5;
    pts += stats.goals * 8;
  } else if (position === "DEF") {
    pts += stats.goals * 6;
  } else if (position === "MID") {
    pts += stats.goals * 5;
  } else {
    pts += stats.goals * 4; // FWD
  }

  pts += stats.assists * 3;

  if (stats.cleanSheet) {
    if (position === "GK") pts += 4;
    else if (position === "DEF") pts += 3;
  }

  return pts;
}

export function applyCapitainMultiplier(basePoints: number): number {
  if (basePoints <= 0) return basePoints;
  return basePoints * 2;
}

export function calculateFantasyTeamPoints(
  fantasyTeam: FantasyTeam,
  playerStatsMap: Map<string, FantasyPlayerMatchStats>,
  playersMap: Map<string, FantasyPlayer>,
  bonuses: FantasyCompetitionBonuses | null,
): FantasyTeamPointsBreakdown {
  const { startingEleven, bench, captainId } = fantasyTeam;

  const starterIds = [
    startingEleven.goalkeeperId,
    ...startingEleven.defenderIds,
    ...startingEleven.midfielderIds,
    ...startingEleven.forwardIds,
  ];

  const benchByPosition: Record<Position, string> = {
    GK: bench.goalkeeperId,
    DEF: bench.defenderId,
    MID: bench.midfielderId,
    FWD: bench.forwardId,
  };

  const playerBreakdown: FantasyTeamPointsBreakdown["playerBreakdown"] = [];
  const automaticSubstitutions: FantasyTeamPointsBreakdown["automaticSubstitutions"] =
    [];

  let totalPlayerPoints = 0;

  for (const playerId of starterIds) {
    const player = playersMap.get(playerId);
    if (!player) continue;

    const stats = playerStatsMap.get(playerId);
    const didNotPlay = !stats || stats.minutesPlayed === 0;

    let basePoints = 0;
    let wasSubstituted = false;
    let substituteId: string | undefined;

    if (didNotPlay) {
      // Try automatic substitution from bench
      const benchId = benchByPosition[player.position];
      const benchStats = benchId ? playerStatsMap.get(benchId) : undefined;

      if (benchId && benchStats && benchStats.minutesPlayed > 0) {
        const benchPlayer = playersMap.get(benchId);
        if (benchPlayer) {
          basePoints = calculatePlayerFantasyPoints(benchStats, benchPlayer.position);
          wasSubstituted = true;
          substituteId = benchId;
          automaticSubstitutions.push({
            starterId: playerId,
            benchId,
            reason: `${player.name} no jugó — sustituido por ${benchPlayer.name}`,
          });
        }
      }
    } else {
      basePoints = calculatePlayerFantasyPoints(stats, player.position);
    }

    const isCaptain = playerId === captainId;
    const captainBonus = isCaptain ? Math.max(0, basePoints) : 0;
    const finalPoints = isCaptain
      ? applyCapitainMultiplier(basePoints)
      : basePoints;

    totalPlayerPoints += finalPoints;

    playerBreakdown.push({
      playerId,
      name: player.name,
      position: player.position,
      basePoints,
      captainBonus,
      finalPoints,
      wasSubstituted,
      substituteId,
    });
  }

  const bonusValues = {
    championTeamBonus: bonuses?.championTeamBonus ?? 0,
    surpriseTeamBonus: bonuses?.surpriseTeamBonus ?? 0,
    disappointmentTeamBonus: bonuses?.disappointmentTeamBonus ?? 0,
    tournamentMvpBonus: bonuses?.tournamentMvpBonus ?? 0,
  };

  const totalBonus = Object.values(bonusValues).reduce((a, b) => a + b, 0);
  const totalPoints = totalPlayerPoints + totalBonus;

  return {
    totalPoints,
    playerBreakdown,
    automaticSubstitutions,
    bonuses: bonusValues,
  };
}

export function getRankingLabel(rank: number, points: number): string {
  if (rank === 1) return "Visionario";
  if (rank === 2) return "Scouting premium";
  if (rank === 3) return "Modo pulpo Paul";
  if (points > 50) return "El que sabe cosas";
  if (points >= 20) return "Antifútbol efectivo";
  if (points < 20 && points > 0) return "Vendió humo";
  return "Director deportivo con WiFi de hotel";
}
