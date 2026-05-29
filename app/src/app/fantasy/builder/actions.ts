"use server";

import { getCurrentUser } from "@/lib/db";
import {
  createFantasyTeam,
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyLeagueById,
} from "@/lib/fantasy-db";
import { getPlayersByCompetition } from "@/lib/fantasy-db";
import { validateFantasyTeam } from "@/lib/fantasy-validation";
import type { FantasyStartingEleven, FantasyBench } from "@/types/fantasy";

export interface CreateFantasyTeamInput {
  competitionId: string;
  leagueId?: string | null;
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
    const leagueId = data.leagueId ?? null;

    if (leagueId) {
      const league = await getFantasyLeagueById(leagueId);
      if (!league) return { error: "Liga no encontrada." };
      if (!league.memberIds.includes(user.id)) {
        return { error: "Debes ser miembro de la liga para crear un equipo." };
      }
      if (league.competitionId !== data.competitionId) {
        return { error: "La liga no pertenece a esta competición." };
      }

      const existingLeague = await getFantasyTeamForLeague(
        user.id,
        data.competitionId,
        leagueId,
      );
      if (existingLeague) {
        return { error: "Ya tienes un equipo en esta liga." };
      }
    } else {
      const existingGlobal = await getGlobalFantasyTeam(user.id, data.competitionId);
      if (existingGlobal) {
        return { error: "Ya tienes un equipo en el Fantasy global." };
      }
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
      leagueId,
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
