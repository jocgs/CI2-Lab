import type { FantasyTeam } from "@/types/fantasy";
import type { UserTournamentPicks } from "@/types/picks";
import type { BolaDeCristalOfficialAnswers } from "@/lib/bola-de-cristal-official-answers";

type PickCategory = "team" | "player";

interface PickSlot {
  category: PickCategory;
  userValue: string | null | undefined;
  officialValue: string | null | undefined;
}

function slotsFrom(
  fantasyTeam: FantasyTeam | null,
  picks: UserTournamentPicks | null,
  official: BolaDeCristalOfficialAnswers,
): PickSlot[] {
  return [
    {
      category: "team",
      userValue: fantasyTeam?.championTeamId,
      officialValue: official.championTeamId,
    },
    {
      category: "team",
      userValue: fantasyTeam?.disappointmentTeamId,
      officialValue: official.disappointmentTeamId,
    },
    {
      category: "team",
      userValue: picks?.revelationTeamId,
      officialValue: official.revelationTeamId,
    },
    {
      category: "team",
      userValue: picks?.bestGoalTeamId,
      officialValue: official.bestGoalTeamId,
    },
    {
      category: "team",
      userValue: picks?.bestGroupStageTeamId,
      officialValue: official.bestGroupStageTeamId,
    },
    {
      category: "team",
      userValue: picks?.worstGroupStageTeamId,
      officialValue: official.worstGroupStageTeamId,
    },
    {
      category: "team",
      userValue: picks?.bestNonUefaConmebolTeamId,
      officialValue: official.bestNonUefaConmebolTeamId,
    },
    {
      category: "player",
      userValue: picks?.ballonDOrPlayerId,
      officialValue: official.ballonDOrPlayerId,
    },
    {
      category: "player",
      userValue: picks?.goldenBootPlayerId,
      officialValue: official.goldenBootPlayerId,
    },
    {
      category: "player",
      userValue: picks?.goldenGlovePlayerId,
      officialValue: official.goldenGlovePlayerId,
    },
    {
      category: "player",
      userValue: picks?.bestYoungPlayerId,
      officialValue: official.bestYoungPlayerId,
    },
    {
      category: "player",
      userValue: picks?.topAssistPlayerId,
      officialValue: official.topAssistPlayerId,
    },
  ];
}

export interface BolaDeCristalEvaluation {
  /** Predicciones con respuesta oficial y elección del usuario. */
  gradableCount: number;
  correctCount: number;
  teamGradableCount: number;
  teamCorrectCount: number;
  playerGradableCount: number;
  playerCorrectCount: number;
  /** Todas las de selecciones acertadas (solo si hay al menos una calificable). */
  allTeamPicksCorrect: boolean;
  /** Todas las de jugadores acertadas (solo si hay al menos una calificable). */
  allPlayerPicksCorrect: boolean;
  target25: number;
  target50: number;
}

export function evaluateBolaDeCristalPicks(
  fantasyTeam: FantasyTeam | null,
  picks: UserTournamentPicks | null,
  official: BolaDeCristalOfficialAnswers | null,
): BolaDeCristalEvaluation {
  const empty: BolaDeCristalEvaluation = {
    gradableCount: 0,
    correctCount: 0,
    teamGradableCount: 0,
    teamCorrectCount: 0,
    playerGradableCount: 0,
    playerCorrectCount: 0,
    allTeamPicksCorrect: false,
    allPlayerPicksCorrect: false,
    target25: 1,
    target50: 1,
  };

  if (!official) return empty;

  const slots = slotsFrom(fantasyTeam, picks, official);
  let gradableCount = 0;
  let correctCount = 0;
  let teamGradableCount = 0;
  let teamCorrectCount = 0;
  let playerGradableCount = 0;
  let playerCorrectCount = 0;

  for (const slot of slots) {
    const userPick = slot.userValue?.trim();
    const officialAnswer = slot.officialValue?.trim();
    if (!userPick || !officialAnswer) continue;

    gradableCount += 1;
    const isCorrect = userPick === officialAnswer;
    if (isCorrect) correctCount += 1;

    if (slot.category === "team") {
      teamGradableCount += 1;
      if (isCorrect) teamCorrectCount += 1;
    } else {
      playerGradableCount += 1;
      if (isCorrect) playerCorrectCount += 1;
    }
  }

  return {
    gradableCount,
    correctCount,
    teamGradableCount,
    teamCorrectCount,
    playerGradableCount,
    playerCorrectCount,
    allTeamPicksCorrect: teamGradableCount > 0 && teamCorrectCount === teamGradableCount,
    allPlayerPicksCorrect:
      playerGradableCount > 0 && playerCorrectCount === playerGradableCount,
    target25: Math.max(1, Math.ceil(gradableCount * 0.25)),
    target50: Math.max(1, Math.ceil(gradableCount * 0.5)),
  };
}
