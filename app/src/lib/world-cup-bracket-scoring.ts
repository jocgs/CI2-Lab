import type {
  BracketRound,
  GroupStandings,
  KnockoutWinners,
  UserWorldCupBracketPrediction,
} from "@/types/bracket-prediction";
import type { WorldCupBracketOfficialAnswers } from "@/lib/world-cup-bracket-official-answers";
import { WORLD_CUP_GROUP_LETTERS } from "@/lib/world-cup-groups";

export const BRACKET_KNOCKOUT_POINTS: Record<BracketRound, number> = {
  round_of_32: 1,
  round_of_16: 2,
  quarter_finals: 4,
  semi_finals: 6,
  third_place: 5,
  final: 10,
};

export const BRACKET_GROUP_POINTS = {
  first: 3,
  second: 2,
  thirdQualifying: 2,
  thirdGroupPick: 1,
} as const;

export interface BracketScoreBreakdown {
  totalPoints: number;
  maxPoints: number;
  groupPoints: number;
  thirdPickPoints: number;
  knockoutPoints: number;
  gradableGroupSlots: number;
  correctGroupSlots: number;
  gradableKnockoutMatches: number;
  correctKnockoutMatches: number;
  gradableThirdGroups: number;
  correctThirdGroups: number;
}

export interface BracketScoreEvaluation extends BracketScoreBreakdown {
  hasOfficialData: boolean;
}

function scoreGroupStandings(
  user: GroupStandings,
  official: GroupStandings,
  officialThirdGroups: Set<string>,
): Pick<
  BracketScoreBreakdown,
  "groupPoints" | "thirdPickPoints" | "gradableGroupSlots" | "correctGroupSlots" | "gradableThirdGroups" | "correctThirdGroups"
> {
  let groupPoints = 0;
  let gradableGroupSlots = 0;
  let correctGroupSlots = 0;

  for (const group of WORLD_CUP_GROUP_LETTERS) {
    const userOrder = user[group];
    const officialOrder = official[group];
    if (!userOrder?.length || !officialOrder?.length) continue;

    for (let pos = 0; pos < 4; pos++) {
      if (!officialOrder[pos]) continue;
      gradableGroupSlots += 1;
      if (userOrder[pos] === officialOrder[pos]) {
        correctGroupSlots += 1;
        if (pos === 0) groupPoints += BRACKET_GROUP_POINTS.first;
        else if (pos === 1) groupPoints += BRACKET_GROUP_POINTS.second;
        else if (pos === 2 && officialThirdGroups.has(group)) {
          groupPoints += BRACKET_GROUP_POINTS.thirdQualifying;
        }
      }
    }
  }

  return {
    groupPoints,
    thirdPickPoints: 0,
    gradableGroupSlots,
    correctGroupSlots,
    gradableThirdGroups: 0,
    correctThirdGroups: 0,
  };
}

function scoreThirdGroups(
  userGroups: string[],
  officialGroups: string[],
): Pick<
  BracketScoreBreakdown,
  "thirdPickPoints" | "gradableThirdGroups" | "correctThirdGroups"
> {
  const officialSet = new Set(officialGroups);
  let thirdPickPoints = 0;
  let gradableThirdGroups = officialGroups.length;
  let correctThirdGroups = 0;

  for (const group of userGroups) {
    if (officialSet.has(group)) {
      correctThirdGroups += 1;
      thirdPickPoints += BRACKET_GROUP_POINTS.thirdGroupPick;
    }
  }

  return { thirdPickPoints, gradableThirdGroups, correctThirdGroups };
}

function scoreKnockout(
  userWinners: KnockoutWinners,
  officialWinners: KnockoutWinners,
  matchRounds: Record<string, BracketRound>,
): Pick<
  BracketScoreBreakdown,
  "knockoutPoints" | "gradableKnockoutMatches" | "correctKnockoutMatches"
> {
  let knockoutPoints = 0;
  let gradableKnockoutMatches = 0;
  let correctKnockoutMatches = 0;

  for (const [matchId, officialWinner] of Object.entries(officialWinners)) {
    if (!officialWinner) continue;
    const round = matchRounds[matchId];
    if (!round) continue;
    gradableKnockoutMatches += 1;
    if (userWinners[matchId] === officialWinner) {
      correctKnockoutMatches += 1;
      knockoutPoints += BRACKET_KNOCKOUT_POINTS[round];
    }
  }

  return { knockoutPoints, gradableKnockoutMatches, correctKnockoutMatches };
}

export function evaluateWorldCupBracketScore(
  prediction: Pick<
    UserWorldCupBracketPrediction,
    "groupStandings" | "qualifyingThirdGroups" | "knockoutWinners"
  >,
  official: WorldCupBracketOfficialAnswers | null,
  matchRounds: Record<string, BracketRound>,
): BracketScoreEvaluation {
  const empty: BracketScoreEvaluation = {
    totalPoints: 0,
    maxPoints: 0,
    groupPoints: 0,
    thirdPickPoints: 0,
    knockoutPoints: 0,
    gradableGroupSlots: 0,
    correctGroupSlots: 0,
    gradableKnockoutMatches: 0,
    correctKnockoutMatches: 0,
    gradableThirdGroups: 0,
    correctThirdGroups: 0,
    hasOfficialData: false,
  };

  if (!official?.groupStandings || !official.qualifyingThirdGroups || !official.knockoutWinners) {
    return empty;
  }

  const officialThirdSet = new Set(official.qualifyingThirdGroups);
  const groupScore = scoreGroupStandings(
    prediction.groupStandings,
    official.groupStandings,
    officialThirdSet,
  );
  const thirdScore = scoreThirdGroups(
    prediction.qualifyingThirdGroups,
    official.qualifyingThirdGroups,
  );
  const knockoutScore = scoreKnockout(
    prediction.knockoutWinners,
    official.knockoutWinners,
    matchRounds,
  );

  const totalPoints =
    groupScore.groupPoints + thirdScore.thirdPickPoints + knockoutScore.knockoutPoints;

  const maxGroup =
    WORLD_CUP_GROUP_LETTERS.length * (BRACKET_GROUP_POINTS.first + BRACKET_GROUP_POINTS.second) +
    officialThirdSet.size * BRACKET_GROUP_POINTS.thirdQualifying;
  const maxThird = official.qualifyingThirdGroups.length * BRACKET_GROUP_POINTS.thirdGroupPick;
  const maxKnockout = Object.entries(official.knockoutWinners).reduce((sum, [id]) => {
    const round = matchRounds[id];
    return sum + (round ? BRACKET_KNOCKOUT_POINTS[round] : 0);
  }, 0);

  return {
    ...groupScore,
    ...thirdScore,
    ...knockoutScore,
    totalPoints,
    maxPoints: maxGroup + maxThird + maxKnockout,
    hasOfficialData: true,
  };
}
