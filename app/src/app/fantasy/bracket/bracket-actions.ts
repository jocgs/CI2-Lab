"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/db";
import { saveUserWorldCupBracketPrediction } from "@/lib/bracket-prediction-db";
import {
  areGroupStandingsComplete,
  isBracketComplete,
  pruneInvalidWinners,
  validateGroupStandings,
  validateKnockoutWinners,
  validateQualifyingThirdGroups,
} from "@/lib/world-cup-bracket";
import { getWorldCupGroups } from "@/lib/world-cup-groups";
import { isFantasyCompetitionLocked, fantasyLockMessage } from "@/lib/fantasy-lock";
import type { GroupStandings, KnockoutWinners } from "@/types/bracket-prediction";

export async function saveWorldCupBracketAction(data: {
  tournamentId: string;
  groupStandings: GroupStandings;
  qualifyingThirdGroups: string[];
  knockoutWinners: KnockoutWinners;
}): Promise<{ error?: string }> {
  try {
    if (isFantasyCompetitionLocked()) {
      return { error: fantasyLockMessage() };
    }

    const user = await getCurrentUser();
    const groups = getWorldCupGroups();

    const groupError = validateGroupStandings(data.groupStandings, groups);
    if (groupError) return { error: groupError };

    if (!areGroupStandingsComplete(data.groupStandings)) {
      return { error: "Completa la clasificación de los 12 grupos." };
    }

    const thirdError = validateQualifyingThirdGroups(data.qualifyingThirdGroups);
    if (thirdError) return { error: thirdError };

    const input = {
      groupStandings: data.groupStandings,
      qualifyingThirdGroups: data.qualifyingThirdGroups,
      knockoutWinners: data.knockoutWinners,
    };

    const prunedWinners = pruneInvalidWinners(input);
    const knockoutError = validateKnockoutWinners({ ...input, knockoutWinners: prunedWinners });
    if (knockoutError) return { error: knockoutError };

    if (!isBracketComplete({ ...input, knockoutWinners: prunedWinners })) {
      return {
        error: "Completa todos los cruces de eliminatorias, incluida la final y el 3.er puesto.",
      };
    }

    await saveUserWorldCupBracketPrediction({
      userId: user.id,
      tournamentId: data.tournamentId,
      groupStandings: data.groupStandings,
      qualifyingThirdGroups: data.qualifyingThirdGroups,
      knockoutWinners: prunedWinners,
    });

    revalidatePath("/fantasy/bracket");
    revalidatePath("/fantasy");

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
