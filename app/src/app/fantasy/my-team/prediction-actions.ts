"use server";

import { getCurrentUser } from "@/lib/db";
import { getFantasyTeamByUserAndCompetition, updateFantasyTeam } from "@/lib/fantasy-db";
import { validateFantasyPredictions } from "@/lib/fantasy-validation";

export interface SavePredictionsInput {
  competitionId: string;
  championTeamId: string;
  surpriseTeamId: string;
  disappointmentTeamId: string;
  tournamentMvpPlayerId: string;
}

export async function savePredictionsAction(
  data: SavePredictionsInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();

    const team = await getFantasyTeamByUserAndCompetition(user.id, data.competitionId);
    if (!team) return { error: "No tienes equipo en esta competición." };
    if (team.locked) return { error: "Tu equipo está bloqueado. Ya no puedes fingir que sabías." };

    const errors = validateFantasyPredictions({
      championTeamId:        data.championTeamId,
      surpriseTeamId:        data.surpriseTeamId,
      disappointmentTeamId:  data.disappointmentTeamId,
      tournamentMvpPlayerId: data.tournamentMvpPlayerId,
    });
    if (errors.length > 0) return { error: errors[0].message };

    await updateFantasyTeam(team.id, {
      championTeamId:        data.championTeamId,
      surpriseTeamId:        data.surpriseTeamId,
      disappointmentTeamId:  data.disappointmentTeamId,
      tournamentMvpPlayerId: data.tournamentMvpPlayerId,
    });

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
