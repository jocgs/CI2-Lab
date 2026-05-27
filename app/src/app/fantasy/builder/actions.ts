"use server";

import { getCurrentUser } from "@/lib/db";
import { createFantasyTeam, getFantasyTeamByUserAndCompetition } from "@/lib/fantasy-db";
import { getPlayersByCompetition } from "@/lib/fantasy-db";
import { validateFantasyTeam } from "@/lib/fantasy-validation";
import type { FantasyStartingEleven, FantasyBench } from "@/types/fantasy";

export interface CreateFantasyTeamInput {
  competitionId: string;
  teamName: string;
  startingEleven: FantasyStartingEleven;
  bench: FantasyBench;
  captainId: string;
}

export async function createFantasyTeamAction(
  data: CreateFantasyTeamInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();

    const existing = await getFantasyTeamByUserAndCompetition(
      user.id,
      data.competitionId,
    );
    if (existing) {
      return { error: "Ya tienes un equipo en esta competición." };
    }

    const players = await getPlayersByCompetition(data.competitionId);

    const partialTeam = {
      teamName: data.teamName,
      startingEleven: data.startingEleven,
      bench: data.bench,
      captainId: data.captainId,
    };

    const errors = validateFantasyTeam(partialTeam, players, false);
    if (errors.length > 0) {
      return { error: errors[0].message };
    }

    await createFantasyTeam({
      userId: user.id,
      competitionId: data.competitionId,
      teamName: data.teamName,
      startingEleven: data.startingEleven,
      bench: data.bench,
      captainId: data.captainId,
    });

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: message };
  }
}
