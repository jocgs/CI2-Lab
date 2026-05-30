import type {
  Bet,
  BetPrediction,
  Match,
  Outcome,
  RankingEntry,
  User,
  UserStreak,
} from "@/types/domain";

export const POINTS_PER_OUTCOME = 1;
export const POINTS_PER_EXACT_SCORE = 2;

export function outcomeFromGoals(home: number, away: number): Outcome {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export function getPointsForBet(bet: Bet, match: Match): number {
  if (match.status !== "FINISHED" || !match.result) return 0;

  if (
    bet.prediction.homeGoals === match.result.homeGoals &&
    bet.prediction.awayGoals === match.result.awayGoals
  ) {
    return POINTS_PER_EXACT_SCORE;
  }

  return bet.prediction.outcome === match.result.outcome ? POINTS_PER_OUTCOME : 0;
}

export function formatBetPrediction(prediction: BetPrediction): string {
  return `${prediction.outcome} · ${prediction.homeGoals}-${prediction.awayGoals}`;
}

/**
 * Construye el ranking de un conjunto de usuarios a partir de sus porras
 * resueltas. Devuelve los usuarios ordenados por puntos descendente.
 *
 * @param memberSince  Mapa userId → fecha ISO: solo se cuentan porras cuyo
 *                     `createdAt` es igual o posterior a esa fecha.
 *                     Si no se pasa (ranking global) se cuentan todas.
 */
export function buildRanking(
  users: User[],
  bets: Bet[],
  matches: Match[],
  rankChanges?: Record<string, number>,
  memberSince?: Record<string, string>,
): RankingEntry[] {
  const matchById = new Map(matches.map((m) => [m.id, m]));

  return users
    .map<RankingEntry>((user) => {
      const since = memberSince?.[user.id];
      const sinceMs = since ? new Date(since).getTime() : null;

      const userBets = bets.filter((b) => {
        if (b.userId !== user.id) return false;
        if (sinceMs !== null && new Date(b.createdAt).getTime() < sinceMs) return false;
        return true;
      });

      const resolvedBets = userBets.filter((b) => {
        const m = matchById.get(b.matchId);
        return m?.status === "FINISHED";
      });

      const totalPoints = resolvedBets.reduce((sum, bet) => {
        const m = matchById.get(bet.matchId);
        return sum + (m ? getPointsForBet(bet, m) : 0);
      }, 0);

      const correctBets = resolvedBets.filter((b) => b.status === "WON").length;
      const exactBets = resolvedBets.filter((bet) => {
        const m = matchById.get(bet.matchId);
        return m ? getPointsForBet(bet, m) === POINTS_PER_EXACT_SCORE : false;
      }).length;
      const totalBets = resolvedBets.length;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        totalPoints,
        correctBets,
        exactBets,
        totalBets,
        accuracy: totalBets === 0 ? 0 : Math.round((correctBets / totalBets) * 100),
        rankChange: rankChanges?.[user.id],
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || b.accuracy - a.accuracy);
}

/**
 * Calcula la racha del usuario: número de aciertos consecutivos más
 * recientes (en orden cronológico) y la mejor racha histórica.
 */
export function computeStreak(userId: string, bets: Bet[], matches: Match[]): UserStreak {
  const matchById = new Map(matches.map((m) => [m.id, m]));

  const resolved = bets
    .filter((b) => b.userId === userId)
    .filter((b) => matchById.get(b.matchId)?.status === "FINISHED")
    .sort((a, b) => {
      const ma = matchById.get(a.matchId)!;
      const mb = matchById.get(b.matchId)!;
      return new Date(ma.kickoffAt).getTime() - new Date(mb.kickoffAt).getTime();
    });

  let best = 0;
  let current = 0;
  let runningCurrent = 0;

  for (const bet of resolved) {
    if (bet.status === "WON") {
      runningCurrent += 1;
      best = Math.max(best, runningCurrent);
    } else {
      runningCurrent = 0;
    }
  }
  current = runningCurrent;

  return { userId, current, best };
}

/**
 * Mayor racha de aciertos de resultado (1X2) en partidos consecutivos del mismo club.
 * Cuenta porras ganadas (acierto de signo o marcador exacto) en partidos FINISHED ordenados por fecha.
 */
export function maxConsecutiveTeamOutcomeStreak(
  userId: string,
  bets: Bet[],
  matches: Match[],
  teamIds: string[],
): number {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  let bestOverall = 0;

  for (const teamId of teamIds) {
    const teamMatches = matches
      .filter(
        (m) =>
          m.status === "FINISHED" &&
          (m.homeTeamId === teamId || m.awayTeamId === teamId),
      )
      .sort(
        (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
      );

    let streak = 0;
    for (const match of teamMatches) {
      const bet = bets.find((b) => b.userId === userId && b.matchId === match.id);
      if (bet && bet.status === "WON") {
        streak += 1;
        bestOverall = Math.max(bestOverall, streak);
      } else {
        streak = 0;
      }
    }
  }

  return bestOverall;
}
