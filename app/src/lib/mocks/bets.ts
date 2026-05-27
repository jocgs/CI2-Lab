import type { Bet } from "@/types/domain";

/**
 * Porras mock. Cubren los 5 partidos FINISHED para alimentar ranking y
 * rachas, más algunas pendientes sobre partidos próximos.
 *
 * Resultados de referencia de los partidos terminados:
 *   match_1: 1   |   match_2: 1   |   match_3: X   |   match_4: 2   |   match_5: 2
 */
export const MOCK_BETS: Bet[] = [
  // ----- Clara: L W W W W → racha 4, mejor 4, 6 pts -----
  { id: "bet_c1", userId: "user_clara", matchId: "match_1", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-18T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_c2", userId: "user_clara", matchId: "match_2", prediction: { outcome: "1", homeGoals: 2, awayGoals: 0 }, createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 1 },
  { id: "bet_c3", userId: "user_clara", matchId: "match_3", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_c4", userId: "user_clara", matchId: "match_4", prediction: { outcome: "2", homeGoals: 0, awayGoals: 1 }, createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 1 },
  { id: "bet_c5", userId: "user_clara", matchId: "match_5", prediction: { outcome: "2", homeGoals: 0, awayGoals: 2 }, createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_c7", userId: "user_clara", matchId: "match_7", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-26T08:00:00.000Z", status: "PENDING", points: 0 },
  { id: "bet_c9", userId: "user_clara", matchId: "match_9", prediction: { outcome: "1", homeGoals: 1, awayGoals: 0 }, createdAt: "2026-05-26T08:05:00.000Z", status: "PENDING", points: 0 },

  // ----- Marina: W W L W L → 5 pts, racha actual 0 -----
  { id: "bet_m1", userId: "user_marina", matchId: "match_1", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_m2", userId: "user_marina", matchId: "match_2", prediction: { outcome: "1", homeGoals: 2, awayGoals: 0 }, createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 1 },
  { id: "bet_m3", userId: "user_marina", matchId: "match_3", prediction: { outcome: "1", homeGoals: 2, awayGoals: 0 }, createdAt: "2026-05-20T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_m4", userId: "user_marina", matchId: "match_4", prediction: { outcome: "2", homeGoals: 1, awayGoals: 2 }, createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_m5", userId: "user_marina", matchId: "match_5", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-24T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_m7", userId: "user_marina", matchId: "match_7", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-26T09:00:00.000Z", status: "PENDING", points: 0 },

  // ----- Pablo: L W W W (sin porra en match_5) → 5 pts, racha 3 -----
  { id: "bet_p1", userId: "user_pablo", matchId: "match_1", prediction: { outcome: "2", homeGoals: 0, awayGoals: 1 }, createdAt: "2026-05-18T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_p2", userId: "user_pablo", matchId: "match_2", prediction: { outcome: "1", homeGoals: 3, awayGoals: 0 }, createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_p3", userId: "user_pablo", matchId: "match_3", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_p4", userId: "user_pablo", matchId: "match_4", prediction: { outcome: "2", homeGoals: 0, awayGoals: 1 }, createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 1 },
  { id: "bet_p8", userId: "user_pablo", matchId: "match_8", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-26T09:00:00.000Z", status: "PENDING", points: 0 },

  // ----- Lucía: W L W L W → 6 pts, racha 1 -----
  { id: "bet_l1", userId: "user_lucia", matchId: "match_1", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_l2", userId: "user_lucia", matchId: "match_2", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-19T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_l3", userId: "user_lucia", matchId: "match_3", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_l4", userId: "user_lucia", matchId: "match_4", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-22T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_l5", userId: "user_lucia", matchId: "match_5", prediction: { outcome: "2", homeGoals: 0, awayGoals: 2 }, createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 2 },

  // ----- Diego: W L L L W → 4 pts, racha 1 -----
  { id: "bet_d1", userId: "user_diego", matchId: "match_1", prediction: { outcome: "1", homeGoals: 2, awayGoals: 1 }, createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 2 },
  { id: "bet_d2", userId: "user_diego", matchId: "match_2", prediction: { outcome: "2", homeGoals: 1, awayGoals: 2 }, createdAt: "2026-05-19T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d3", userId: "user_diego", matchId: "match_3", prediction: { outcome: "1", homeGoals: 2, awayGoals: 0 }, createdAt: "2026-05-20T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d4", userId: "user_diego", matchId: "match_4", prediction: { outcome: "X", homeGoals: 1, awayGoals: 1 }, createdAt: "2026-05-22T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d5", userId: "user_diego", matchId: "match_5", prediction: { outcome: "2", homeGoals: 0, awayGoals: 2 }, createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 2 },
];
