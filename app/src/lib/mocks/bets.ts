import type { Bet } from "@/types/domain";

/**
 * Porras mock. Cubren los 5 partidos FINISHED para alimentar ranking y
 * rachas, más algunas pendientes sobre partidos próximos.
 *
 * Resultados de referencia de los partidos terminados:
 *   match_1: 1   |   match_2: 1   |   match_3: X   |   match_4: 2   |   match_5: 2
 */
export const MOCK_BETS: Bet[] = [
  // ----- Clara: W W W W W → racha 5, mejor 5, 15 pts -----
  { id: "bet_c1", userId: "user_clara", matchId: "match_1", prediction: "1", createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_c2", userId: "user_clara", matchId: "match_2", prediction: "1", createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_c3", userId: "user_clara", matchId: "match_3", prediction: "X", createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_c4", userId: "user_clara", matchId: "match_4", prediction: "2", createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_c5", userId: "user_clara", matchId: "match_5", prediction: "2", createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_c7", userId: "user_clara", matchId: "match_7", prediction: "1", createdAt: "2026-05-26T08:00:00.000Z", status: "PENDING", points: 0 },
  { id: "bet_c9", userId: "user_clara", matchId: "match_9", prediction: "1", createdAt: "2026-05-26T08:05:00.000Z", status: "PENDING", points: 0 },

  // ----- Marina: W W L W L → 9 pts, racha actual 0 -----
  { id: "bet_m1", userId: "user_marina", matchId: "match_1", prediction: "1", createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_m2", userId: "user_marina", matchId: "match_2", prediction: "1", createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_m3", userId: "user_marina", matchId: "match_3", prediction: "1", createdAt: "2026-05-20T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_m4", userId: "user_marina", matchId: "match_4", prediction: "2", createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_m5", userId: "user_marina", matchId: "match_5", prediction: "X", createdAt: "2026-05-24T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_m7", userId: "user_marina", matchId: "match_7", prediction: "X", createdAt: "2026-05-26T09:00:00.000Z", status: "PENDING", points: 0 },

  // ----- Pablo: L W W W (sin porra en match_5) → 9 pts, racha 3 -----
  { id: "bet_p1", userId: "user_pablo", matchId: "match_1", prediction: "2", createdAt: "2026-05-18T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_p2", userId: "user_pablo", matchId: "match_2", prediction: "1", createdAt: "2026-05-19T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_p3", userId: "user_pablo", matchId: "match_3", prediction: "X", createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_p4", userId: "user_pablo", matchId: "match_4", prediction: "2", createdAt: "2026-05-22T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_p8", userId: "user_pablo", matchId: "match_8", prediction: "1", createdAt: "2026-05-26T09:00:00.000Z", status: "PENDING", points: 0 },

  // ----- Lucía: W L W L W → 9 pts, racha 1 -----
  { id: "bet_l1", userId: "user_lucia", matchId: "match_1", prediction: "1", createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_l2", userId: "user_lucia", matchId: "match_2", prediction: "X", createdAt: "2026-05-19T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_l3", userId: "user_lucia", matchId: "match_3", prediction: "X", createdAt: "2026-05-20T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_l4", userId: "user_lucia", matchId: "match_4", prediction: "1", createdAt: "2026-05-22T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_l5", userId: "user_lucia", matchId: "match_5", prediction: "2", createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 3 },

  // ----- Diego: W L L L W → 6 pts, racha 1 -----
  { id: "bet_d1", userId: "user_diego", matchId: "match_1", prediction: "1", createdAt: "2026-05-18T10:00:00.000Z", status: "WON", points: 3 },
  { id: "bet_d2", userId: "user_diego", matchId: "match_2", prediction: "2", createdAt: "2026-05-19T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d3", userId: "user_diego", matchId: "match_3", prediction: "1", createdAt: "2026-05-20T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d4", userId: "user_diego", matchId: "match_4", prediction: "X", createdAt: "2026-05-22T10:00:00.000Z", status: "LOST", points: 0 },
  { id: "bet_d5", userId: "user_diego", matchId: "match_5", prediction: "2", createdAt: "2026-05-24T10:00:00.000Z", status: "WON", points: 3 },
];
