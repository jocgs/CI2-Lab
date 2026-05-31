import type { GroupStandings, KnockoutWinners } from "@/types/bracket-prediction";

/** Resultados oficiales del cuadro — rellenar cuando se conozcan. */
export interface WorldCupBracketOfficialAnswers {
  tournamentId: string;
  groupStandings?: GroupStandings | null;
  /** 8 letras de grupo cuyos terceros clasificaron. */
  qualifyingThirdGroups?: string[] | null;
  knockoutWinners?: KnockoutWinners | null;
}

const WORLD_CUP_2026_BRACKET_ANSWERS: WorldCupBracketOfficialAnswers = {
  tournamentId: "world_cup_2026",
  groupStandings: null,
  qualifyingThirdGroups: null,
  knockoutWinners: null,
};

export function getWorldCupBracketOfficialAnswers(
  tournamentId: string,
): WorldCupBracketOfficialAnswers | null {
  if (tournamentId === "world_cup_2026") return WORLD_CUP_2026_BRACKET_ANSWERS;
  return null;
}
