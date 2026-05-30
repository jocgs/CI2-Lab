"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  acceptFriendRequestByUsername,
  getCurrentUserId,
  getTeams,
  getUserById,
  removeFriendByUsername,
  requestFriendByUsername,
  updateUserProfile,
} from "@/lib/db";
import { getNationalTeamsByCompetition } from "@/lib/fantasy-db";
import { isValidProfileThemeId } from "@/lib/profile-themes";

const NATIONAL_TEAM_COMPETITION_ID = "world_cup_2026";

function revalidateProfilePaths() {
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/profile/friends");
  revalidatePath("/profile/friend-requests");
}

export type SaveProfileResult = { ok: true } | { error: string };

export async function saveProfileAction(formData: FormData): Promise<SaveProfileResult> {
  try {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  const currentUser = await getUserById(userId);
  if (!currentUser) return { error: "Usuario no encontrado" };

  const avatarFile = formData.get("avatarFile");
  const supportedNationalTeamId = String(formData.get("supportedNationalTeamId") ?? "").trim();
  const primaryTeamId = String(formData.get("supportedTeamId1") ?? "").trim();
  const secondaryTeamId = String(formData.get("supportedTeamId2") ?? "").trim();
  const profileThemeRaw = String(formData.get("profileThemeId") ?? "default").trim();

  const teams = await getTeams();
  const nationalTeams = await getNationalTeamsByCompetition(NATIONAL_TEAM_COMPETITION_ID);

  const supportedTeamIds = [primaryTeamId, secondaryTeamId].filter(Boolean);
  const teamSet = new Set(teams.map((team) => team.id));
  const nationalSet = new Set(nationalTeams.map((team) => team.id));

  if (supportedTeamIds.some((teamId) => !teamSet.has(teamId))) {
    return { error: "Hay un equipo que no existe" };
  }

  if (supportedTeamIds.length > 2) {
    return { error: "Solo puedes guardar uno o dos equipos" };
  }

  if (supportedTeamIds.length === 2 && supportedTeamIds[0] === supportedTeamIds[1]) {
    return { error: "Elige dos equipos distintos" };
  }

  if (supportedNationalTeamId && !nationalSet.has(supportedNationalTeamId)) {
    return { error: "La selección elegida no existe" };
  }

  if (!isValidProfileThemeId(profileThemeRaw)) {
    return { error: "El color de perfil elegido no es válido" };
  }

  let avatarUrl = currentUser.avatarUrl ?? null;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      return { error: "La foto debe ser una imagen" };
    }

    const maxAvatarSize = 900 * 1024;
    if (avatarFile.size > maxAvatarSize) {
      return { error: "La imagen es demasiado grande. Prueba otra foto o hazla más pequeña." };
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const mime = avatarFile.type === "image/png" ? "image/png" : "image/jpeg";
    avatarUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    const maxDataUrlLength = 500_000;
    if (avatarUrl.length > maxDataUrlLength) {
      return { error: "La imagen sigue siendo demasiado grande tras comprimir. Elige otra foto." };
    }
  }

  await updateUserProfile(userId, {
    avatarUrl,
    supportedNationalTeamId: supportedNationalTeamId || null,
    supportedTeamIds,
    profileThemeId: profileThemeRaw,
  });

  const cookieStore = await cookies();
  cookieStore.set("tikitaka-profile-theme", profileThemeRaw, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidateProfilePaths();
  revalidatePath(`/users/${currentUser.username}`);
  return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar el perfil" };
  }
}

function getSafeRedirectTo(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") ?? "/profile").trim();
  return redirectTo.startsWith("/") ? redirectTo : "/profile";
}

function getFriendUsername(formData: FormData) {
  return String(formData.get("friendUsername") ?? "").trim();
}

export async function sendFriendRequestAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const username = getFriendUsername(formData);
  if (!username) return { error: "Introduce un nombre de usuario" };

  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  const safeRedirectTo = getSafeRedirectTo(formData);

  try {
    await requestFriendByUsername(userId, username);
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidateProfilePaths();
  revalidatePath(safeRedirectTo);
  redirect(safeRedirectTo);
}

export async function acceptFriendRequestAction(formData: FormData) {
  const username = getFriendUsername(formData);
  if (!username) throw new Error("Introduce un nombre de usuario");

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const safeRedirectTo = getSafeRedirectTo(formData);

  await acceptFriendRequestByUsername(userId, username);

  revalidateProfilePaths();
  revalidatePath(safeRedirectTo);
  redirect(safeRedirectTo);
}

export async function addFriendAction(
  prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  return sendFriendRequestAction(prevState, formData);
}

export async function removeFriendAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const username = getFriendUsername(formData);
  if (!username) return { error: "Introduce un nombre de usuario" };

  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  const safeRedirectTo = getSafeRedirectTo(formData);

  try {
    await removeFriendByUsername(userId, username);
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidateProfilePaths();
  revalidatePath(safeRedirectTo);
  redirect(safeRedirectTo);
}