"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/db";
import {
  createFantasyLeague,
  getFantasyLeagueByInviteCode,
  joinFantasyLeague,
  leaveFantasyLeague,
} from "@/lib/fantasy-db";

export async function createLeagueAction(data: {
  name: string;
  competitionId: string;
}): Promise<{ league?: { id: string; inviteCode: string }; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!data.name.trim()) return { error: "El nombre de la liga no puede estar vacío." };

    const league = await createFantasyLeague({
      name: data.name.trim(),
      competitionId: data.competitionId,
      ownerId: user.id,
    });

    revalidatePath("/fantasy/leagues");
    return { league: { id: league.id, inviteCode: league.inviteCode } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function joinLeagueAction(
  inviteCode: string,
): Promise<{ leagueId?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!inviteCode.trim()) return { error: "Introduce un código de invitación." };

    const league = await getFantasyLeagueByInviteCode(inviteCode.trim());
    if (!league) return { error: "Código de invitación no válido." };

    const result = await joinFantasyLeague(league.id, user.id);
    if (result.error) return { error: result.error };

    revalidatePath("/fantasy/leagues");
    return { leagueId: league.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function leaveLeagueAction(
  leagueId: string,
): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser();
    const result = await leaveFantasyLeague(leagueId, user.id);
    revalidatePath("/fantasy/leagues");
    return result;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
