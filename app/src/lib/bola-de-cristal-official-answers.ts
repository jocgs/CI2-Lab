/**
 * Respuestas oficiales del torneo para calificar Bola de cristal.
 * Dejar `null` en un campo hasta que el resultado sea conocido.
 * Actualizar aquí (o en Firestore en el futuro) cuando se conozcan los ganadores.
 */
export interface BolaDeCristalOfficialAnswers {
  tournamentId: string;
  championTeamId?: string | null;
  disappointmentTeamId?: string | null;
  revelationTeamId?: string | null;
  ballonDOrPlayerId?: string | null;
  goldenBootPlayerId?: string | null;
  goldenGlovePlayerId?: string | null;
  bestYoungPlayerId?: string | null;
  topAssistPlayerId?: string | null;
  bestGoalTeamId?: string | null;
  bestGroupStageTeamId?: string | null;
  worstGroupStageTeamId?: string | null;
  bestNonUefaConmebolTeamId?: string | null;
}

/** Mundial 2026 — rellenar ids cuando haya resultados oficiales. */
const WORLD_CUP_2026_ANSWERS: BolaDeCristalOfficialAnswers = {
  tournamentId: "world_cup_2026",
  championTeamId: null,
  disappointmentTeamId: null,
  revelationTeamId: null,
  ballonDOrPlayerId: null,
  goldenBootPlayerId: null,
  goldenGlovePlayerId: null,
  bestYoungPlayerId: null,
  topAssistPlayerId: null,
  bestGoalTeamId: null,
  bestGroupStageTeamId: null,
  worstGroupStageTeamId: null,
  bestNonUefaConmebolTeamId: null,
};

export function getBolaDeCristalOfficialAnswers(
  tournamentId: string,
): BolaDeCristalOfficialAnswers | null {
  if (tournamentId === "world_cup_2026") return WORLD_CUP_2026_ANSWERS;
  return null;
}
