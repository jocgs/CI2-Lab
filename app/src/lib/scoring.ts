import type { Bet, Match, Outcome, RankingEntry, User, UserStreak } from "@/types/domain";

/**
 * Reglas de puntuación del MVP (modo 1/X/2):
 *  - Acertar el resultado → 3 puntos
 *  - Fallar              → 0 puntos
 *
 * Cuando el jueves añadamos resultado exacto, esta función crece a algo
 * tipo `getPoints(bet, match, { mode: '1x2' | 'exact' })`.
 */
export const POINTS_PER_CORRECT = 3;

export function outcomeFromGoals(home: number, away: number): Outcome {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export function getPointsForBet(bet: Bet, match: Match): number {
  if (match.status !== "FINISHED" || !match.result) return 0;
  return bet.prediction === match.result.outcome ? POINTS_PER_CORRECT : 0;
}

/**
 * Construye el ranking de un conjunto de usuarios a partir de sus porras
 * resueltas. Devuelve los usuarios ordenados por puntos descendente.
 */
export function buildRanking(
  users: User[],
  bets: Bet[],
  matches: Match[],
): RankingEntry[] {
  const matchById = new Map(matches.map((m) => [m.id, m]));

  return users
    .map<RankingEntry>((user) => {
      const userBets = bets.filter((b) => b.userId === user.id);
      const resolvedBets = userBets.filter((b) => {
        const m = matchById.get(b.matchId);
        return m?.status === "FINISHED";
      });

      const totalPoints = resolvedBets.reduce((sum, bet) => {
        const m = matchById.get(bet.matchId);
        return sum + (m ? getPointsForBet(bet, m) : 0);
      }, 0);

      const correctBets = resolvedBets.filter((b) => b.status === "WON").length;
      const totalBets = resolvedBets.length;

      return {
        userId: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        totalPoints,
        correctBets,
        totalBets,
        accuracy: totalBets === 0 ? 0 : Math.round((correctBets / totalBets) * 100),
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
