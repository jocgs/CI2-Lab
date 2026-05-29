"use server";

import {
  saveFantasyPlayerMatchStats,
  lockFantasyTeamsByCompetition,
  recalculateFantasyRanking,
} from "@/lib/fantasy-db";
import { calculatePlayerFantasyPoints } from "@/lib/fantasy-scoring";
import { FANTASY_PLAYERS } from "@/lib/mocks/fantasy-players-data";
import { getSessionUserId } from "@/lib/session";
import type { Position } from "@/types/fantasy";

// ---------------------------------------------------------------------------
// Guard de admin
// Usa la variable ADMIN_USER_IDS (IDs separados por comas) para autorizar.
// TODO: cuando el modelo de usuario incluya un campo `role`, sustituir por
//       una comprobación en DB (getSessionUser()?.role === "admin").
// ---------------------------------------------------------------------------

async function requireAdmin(): Promise<{ error: string } | null> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "No autenticado." };

  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!adminIds.includes(userId)) return { error: "Acción restringida a administradores." };
  return null;
}

interface AddStatsInput {
  playerId: string;
  matchId: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  penaltySaved: number;
  penaltyMissed: number;
  mvp: boolean;
  minutesPlayed: number;
}

export async function adminAddStatsAction(
  input: AddStatsInput,
): Promise<{ error?: string }> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const player = FANTASY_PLAYERS.find((p) => p.id === input.playerId);
    if (!player) return { error: `Jugador "${input.playerId}" no encontrado.` };

    const partialStats = {
      competitionId: "world_cup_2026",
      matchId: input.matchId,
      playerId: input.playerId,
      goals: input.goals,
      assists: input.assists,
      cleanSheet: input.cleanSheet,
      yellowCards: input.yellowCards,
      redCards: input.redCards,
      penaltySaved: input.penaltySaved,
      penaltyMissed: input.penaltyMissed,
      mvp: input.mvp,
      started: input.minutesPlayed > 0,
      minutesPlayed: input.minutesPlayed,
      fantasyPoints: 0,
    };

    const fantasyPoints = calculatePlayerFantasyPoints(
      { ...partialStats, id: "", fantasyPoints: 0 },
      player.position as Position,
    );

    await saveFantasyPlayerMatchStats({ ...partialStats, fantasyPoints });
    await recalculateFantasyRanking("world_cup_2026");

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: message };
  }
}

export async function adminLockTeamsAction(
  competitionId: string,
): Promise<{ error?: string }> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await lockFantasyTeamsByCompetition(competitionId);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: message };
  }
}

export async function adminRecalculateAction(
  competitionId: string,
): Promise<{ error?: string }> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await recalculateFantasyRanking(competitionId);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { error: message };
  }
}
