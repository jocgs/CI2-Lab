"use server";

import { getCurrentUser } from "@/lib/db";
import {
  createFantasyTeam,
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyLeagueById,
  getFantasyTeamById,
  updateFantasyTeam,
} from "@/lib/fantasy-db";
import { getPlayersByCompetition } from "@/lib/fantasy-db";
import { validateFantasyTeam } from "@/lib/fantasy-validation";
import {
  isFantasyTeamEditable,
  isFantasyCompetitionLocked,
  fantasyLockMessage,
} from "@/lib/fantasy-lock";
import type { FantasyStartingEleven, FantasyBench } from "@/types/fantasy";

export interface SaveFantasySquadInput {
  competitionId: string;
  leagueId?: string | null;
  teamName: string;
  startingEleven: FantasyStartingEleven;
  bench: FantasyBench;
  captainId: string;
}

async function resolveOwnedTeam(
  userId: string,
  competitionId: string,
  leagueId: string | null,
) {
  if (leagueId) {
    const league = await getFantasyLeagueById(leagueId);
    if (!league) return { error: "Liga no encontrada." as const };
    if (!league.memberIds.includes(userId)) {
      return { error: "Debes ser miembro de la liga." as const };
    }
    if (league.competitionId !== competitionId) {
      return { error: "La liga no pertenece a esta competición." as const };
    }
    const team = await getFantasyTeamForLeague(userId, competitionId, leagueId);
    return { team, leagueId };
  }
  const team = await getGlobalFantasyTeam(userId, competitionId);
  return { team, leagueId: null as string | null };
}

export async function createFantasyTeamAction(
  data: SaveFantasySquadInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();
    const leagueId = data.leagueId ?? null;

    const resolved = await resolveOwnedTeam(user.id, data.competitionId, leagueId);
    if ("error" in resolved && resolved.error) return { error: resolved.error };

    if (resolved.team) {
      return {
        error: leagueId
          ? "Ya tienes un equipo en esta liga. Usa editar equipo."
          : "Ya tienes un equipo en el Fantasy global. Usa editar equipo.",
      };
    }

    if (isFantasyCompetitionLocked()) {
      return { error: fantasyLockMessage() };
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

export async function updateFantasyTeamAction(
  fantasyTeamId: string,
  data: SaveFantasySquadInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();
    const existing = await getFantasyTeamById(fantasyTeamId);
    if (!existing) return { error: "Equipo no encontrado." };
    if (existing.userId !== user.id) return { error: "No puedes editar este equipo." };
    if (existing.competitionId !== data.competitionId) {
      return { error: "Competición incorrecta." };
    }

    const leagueId = data.leagueId ?? null;
    if ((existing.leagueId ?? null) !== leagueId) {
      return { error: "El equipo no corresponde a esta liga." };
    }

    if (!isFantasyTeamEditable(existing)) {
      return { error: fantasyLockMessage() };
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

    await updateFantasyTeam(fantasyTeamId, {
      teamName: data.teamName,
      startingEleven: data.startingEleven,
      bench: data.bench,
      captainId: data.captainId,
    });

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
