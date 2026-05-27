"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/db";
import { saveUserTournamentPicks } from "@/lib/picks-db";
import { validateSpecialPicks, isTournamentLocked } from "@/lib/tournament-picks";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";

export interface SavePicksInput {
  tournamentId: string;
  revelationTeamId: string;
  disappointmentTeamId: string;
}

export async function savePicksAction(
  data: SavePicksInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();

    // Tournament lock check
    if (isTournamentLocked(MOCK_TOURNAMENT)) {
      return {
        error: "El torneo ya ha empezado. No puedes modificar tus selecciones.",
      };
    }

    // Business rule validation
    const validation = validateSpecialPicks({
      revelationTeamId: data.revelationTeamId,
      disappointmentTeamId: data.disappointmentTeamId,
      teams: MOCK_TOURNAMENT_TEAMS,
    });

    if (!validation.valid) {
      return { error: validation.error ?? "Error de validación." };
    }

    await saveUserTournamentPicks({
      userId: user.id,
      tournamentId: data.tournamentId,
      revelationTeamId: data.revelationTeamId,
      disappointmentTeamId: data.disappointmentTeamId,
    });

    revalidatePath("/picks");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }
}
