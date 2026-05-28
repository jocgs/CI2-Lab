"use server";

import { getCurrentUser } from "@/lib/db";
import { getFantasyTeamByUserAndCompetition, updateFantasyTeam } from "@/lib/fantasy-db";
import { saveUserTournamentPicks } from "@/lib/picks-db";
import {
  validateSpecialPicks,
  isTournamentLocked,
} from "@/lib/tournament-picks";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";

export interface SaveAllPredictionsInput {
  competitionId: string;
  tournamentId: string;
  championTeamId: string;
  tournamentMvpPlayerId: string;
  disappointmentTeamId: string;
  revelationTeamId: string;
}

export async function saveAllPredictionsAction(
  data: SaveAllPredictionsInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();

    // ── Validar equipo fantasy ────────────────────────────────────────────
    const team = await getFantasyTeamByUserAndCompetition(user.id, data.competitionId);
    if (!team) return { error: "No tienes equipo en esta competición." };
    if (team.locked) return { error: "Tu equipo está bloqueado." };

    if (!data.championTeamId)
      return { error: "Debes seleccionar un campeón." };
    if (!data.tournamentMvpPlayerId)
      return { error: "Debes seleccionar el MVP del torneo." };
    if (!data.disappointmentTeamId)
      return { error: "Debes seleccionar una selección decepción." };
    if (data.championTeamId === data.disappointmentTeamId)
      return { error: "El campeón y la decepción no pueden ser el mismo equipo." };
    if (data.championTeamId === data.revelationTeamId)
      return { error: "El campeón y la selección revelación no pueden ser el mismo equipo." };

    // ── Validar selección revelación ──────────────────────────────────────
    if (isTournamentLocked(MOCK_TOURNAMENT))
      return { error: "El torneo ya ha empezado. No puedes modificar la selección revelación." };

    const revelationValidation = validateSpecialPicks({
      revelationTeamId: data.revelationTeamId || null,
      teams: MOCK_TOURNAMENT_TEAMS,
    });
    if (!revelationValidation.valid)
      return { error: revelationValidation.error ?? "Error en la selección revelación." };

    // ── Guardar en paralelo ───────────────────────────────────────────────
    await Promise.all([
      updateFantasyTeam(team.id, {
        championTeamId:        data.championTeamId,
        tournamentMvpPlayerId: data.tournamentMvpPlayerId,
        disappointmentTeamId:  data.disappointmentTeamId,
      }),
      saveUserTournamentPicks({
        userId:          user.id,
        tournamentId:    data.tournamentId,
        revelationTeamId: data.revelationTeamId,
      }),
    ]);

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
