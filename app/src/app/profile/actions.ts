"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addFriendByUsername,
  getCurrentUserId,
  getTeams,
  getUserById,
  updateUserProfile,
} from "@/lib/db";
import { getNationalTeamsByCompetition } from "@/lib/fantasy-db";

const NATIONAL_TEAM_COMPETITION_ID = "world_cup_2026";

export async function saveProfileAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const currentUser = await getUserById(userId);
  if (!currentUser) throw new Error("Usuario no encontrado");

  const avatarFile = formData.get("avatarFile");
  const supportedNationalTeamId = String(formData.get("supportedNationalTeamId") ?? "").trim();
  const primaryTeamId = String(formData.get("supportedTeamId1") ?? "").trim();
  const secondaryTeamId = String(formData.get("supportedTeamId2") ?? "").trim();

  const teams = await getTeams();
  const nationalTeams = await getNationalTeamsByCompetition(NATIONAL_TEAM_COMPETITION_ID);

  const supportedTeamIds = [primaryTeamId, secondaryTeamId].filter(Boolean);
  const teamSet = new Set(teams.map((team) => team.id));
  const nationalSet = new Set(nationalTeams.map((team) => team.id));

  if (supportedTeamIds.some((teamId) => !teamSet.has(teamId))) {
    throw new Error("Hay un equipo que no existe");
  }

  if (supportedTeamIds.length > 2) {
    throw new Error("Solo puedes guardar uno o dos equipos");
  }

  if (supportedTeamIds.length === 2 && supportedTeamIds[0] === supportedTeamIds[1]) {
    throw new Error("Elige dos equipos distintos");
  }

  if (supportedNationalTeamId && !nationalSet.has(supportedNationalTeamId)) {
    throw new Error("La selección elegida no existe");
  }

  let avatarUrl = currentUser.avatarUrl ?? null;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      throw new Error("La foto debe ser una imagen");
    }

    const maxAvatarSize = 2 * 1024 * 1024;
    if (avatarFile.size > maxAvatarSize) {
      throw new Error("La imagen no puede superar 2 MB");
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    avatarUrl = `data:${avatarFile.type};base64,${buffer.toString("base64")}`;
  }

  await updateUserProfile(userId, {
    avatarUrl,
    supportedNationalTeamId: supportedNationalTeamId || null,
    supportedTeamIds,
  });

  revalidatePath("/profile");
  redirect("/profile");
}

export async function addFriendAction(formData: FormData) {
  const username = String(formData.get("friendUsername") ?? "").trim();
  if (!username) throw new Error("Introduce un nombre de usuario");

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const redirectTo = String(formData.get("redirectTo") ?? "/profile").trim();
  const safeRedirectTo = redirectTo.startsWith("/") ? redirectTo : "/profile";

  await addFriendByUsername(userId, username);

  revalidatePath("/profile");
  revalidatePath(safeRedirectTo);
  redirect(safeRedirectTo);
}