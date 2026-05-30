"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/db";
import {
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  updateFantasyTeam,
} from "@/lib/fantasy-db";
import { saveBolaDeCristalPicks } from "@/lib/picks-db";
import {
  validateSpecialPicks,
  isTournamentLocked,
  DISAPPOINTMENT_MAX_ODDS,
} from "@/lib/tournament-picks";
import { isFantasyTeamEditable, fantasyLockMessage } from "@/lib/fantasy-lock";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { bolaDeCristalHref } from "@/lib/fantasy-routes";
import { getTeamsOutsideUefaConmebol } from "@/lib/bola-de-cristal";

export interface SaveAllPredictionsInput {
  competitionId: string;
  tournamentId: string;
  leagueId?: string | null;
  championTeamId: string;
  disappointmentTeamId: string;
  revelationTeamId: string;
  ballonDOrPlayerId: string;
  goldenBootPlayerId: string;
  goldenGlovePlayerId: string;
  bestYoungPlayerId: string;
  topAssistPlayerId: string;
  bestGoalTeamId: string;
  bestGroupStageTeamId: string;
  worstGroupStageTeamId: string;
  bestNonUefaConmebolTeamId: string;
}

function revalidatePredictionViews(leagueId: string | null) {
  revalidatePath("/fantasy/bola-de-cristal");
  revalidatePath("/fantasy/my-team");
  revalidatePath(bolaDeCristalHref(leagueId));
  if (leagueId) {
    revalidatePath(`/fantasy/my-team?league=${leagueId}`);
  }
}

export async function saveAllPredictionsAction(
  data: SaveAllPredictionsInput,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();

    const leagueId = data.leagueId ?? null;
    const team = leagueId
      ? await getFantasyTeamForLeague(user.id, data.competitionId, leagueId)
      : await getGlobalFantasyTeam(user.id, data.competitionId);
    if (!team) {
      return {
        error: leagueId
          ? "No tienes equipo en esta liga."
          : "No tienes equipo en el Fantasy global.",
      };
    }
    if (!isFantasyTeamEditable(team)) {
      return { error: fantasyLockMessage() };
    }

    if (!data.championTeamId) return { error: "Debes seleccionar un campeón." };
    if (!data.disappointmentTeamId)
      return { error: "Debes seleccionar una selección decepción." };
    if (data.championTeamId === data.disappointmentTeamId)
      return { error: "El campeón y la decepción no pueden ser el mismo equipo." };

    const disTeam = MOCK_TOURNAMENT_TEAMS.find((t) => t.id === data.disappointmentTeamId);
    if (!disTeam || disTeam.marketOdds > DISAPPOINTMENT_MAX_ODDS)
      return {
        error: `La selección decepción debe tener cuota de mercado ≤ ${DISAPPOINTMENT_MAX_ODDS}.`,
      };

    if (!leagueId) {
      if (!data.revelationTeamId)
        return { error: "Debes seleccionar una selección revelación." };
      if (data.championTeamId === data.revelationTeamId)
        return { error: "El campeón y la selección revelación no pueden ser el mismo equipo." };
      if (data.revelationTeamId === data.disappointmentTeamId)
        return { error: "La revelación y la decepción no pueden ser el mismo equipo." };

      if (!data.ballonDOrPlayerId) return { error: "Debes elegir el Balón de oro." };
      if (!data.goldenBootPlayerId) return { error: "Debes elegir la Bota de oro." };
      if (!data.goldenGlovePlayerId) return { error: "Debes elegir el Guante de oro." };
      if (!data.bestYoungPlayerId) return { error: "Debes elegir el mejor jugador joven." };
      if (!data.topAssistPlayerId) return { error: "Debes elegir el máximo asistente." };
      if (!data.bestGoalTeamId) return { error: "Debes elegir la selección del mejor gol." };
      if (!data.bestGroupStageTeamId)
        return { error: "Debes elegir la mejor selección en fase de grupos." };
      if (!data.worstGroupStageTeamId)
        return { error: "Debes elegir la peor selección en fase de grupos." };
      if (!data.bestNonUefaConmebolTeamId)
        return { error: "Debes elegir la mejor selección fuera de UEFA/CONMEBOL." };

      if (data.bestGroupStageTeamId === data.worstGroupStageTeamId)
        return {
          error: "La mejor y la peor selección en grupos no pueden ser la misma.",
        };

      const outsideTeams = getTeamsOutsideUefaConmebol(MOCK_TOURNAMENT_TEAMS);
      if (!outsideTeams.some((t) => t.id === data.bestNonUefaConmebolTeamId))
        return {
          error: "La selección debe ser de fuera de Europa (UEFA) y Sudamérica (CONMEBOL).",
        };

      if (isTournamentLocked(MOCK_TOURNAMENT))
        return { error: "El torneo ya ha empezado. No puedes modificar la revelación." };

      const revelationValidation = validateSpecialPicks({
        revelationTeamId: data.revelationTeamId || null,
        teams: MOCK_TOURNAMENT_TEAMS,
      });
      if (!revelationValidation.valid)
        return { error: revelationValidation.error ?? "Error en la selección revelación." };
    }

    const saves: Promise<unknown>[] = [
      updateFantasyTeam(team.id, {
        championTeamId: data.championTeamId,
        disappointmentTeamId: data.disappointmentTeamId,
        tournamentMvpPlayerId: leagueId ? team.tournamentMvpPlayerId : data.ballonDOrPlayerId,
      }),
    ];

    if (!leagueId) {
      saves.push(
        saveBolaDeCristalPicks({
          userId: user.id,
          tournamentId: data.tournamentId,
          picks: {
            revelationTeamId: data.revelationTeamId,
            ballonDOrPlayerId: data.ballonDOrPlayerId,
            goldenBootPlayerId: data.goldenBootPlayerId,
            goldenGlovePlayerId: data.goldenGlovePlayerId,
            bestYoungPlayerId: data.bestYoungPlayerId,
            topAssistPlayerId: data.topAssistPlayerId,
            bestGoalTeamId: data.bestGoalTeamId,
            bestGroupStageTeamId: data.bestGroupStageTeamId,
            worstGroupStageTeamId: data.worstGroupStageTeamId,
            bestNonUefaConmebolTeamId: data.bestNonUefaConmebolTeamId,
          },
        }),
      );
    }

    await Promise.all(saves);

    revalidatePredictionViews(leagueId);

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
