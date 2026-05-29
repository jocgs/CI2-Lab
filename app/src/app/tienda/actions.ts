"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, purchaseAvatar, setActiveAvatar } from "@/lib/db";

function revalidateUserProfiles(userId: string, username: string) {
  revalidatePath("/profile");
  revalidatePath(`/users/${username}`);
}

export type ShopActionResult = { ok: true } | { error: string };

export async function purchaseAvatarAction(avatarId: string): Promise<ShopActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  let username: string;
  try {
    const user = await purchaseAvatar(userId, avatarId);
    username = user.username;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al comprar" };
  }

  revalidatePath("/tienda");
  revalidateUserProfiles(userId, username);
  return { ok: true };
}

export async function setActiveAvatarAction(avatarId: string | null): Promise<ShopActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  let username: string;
  try {
    const user = await setActiveAvatar(userId, avatarId);
    username = user.username;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al activar avatar" };
  }

  revalidatePath("/tienda");
  revalidateUserProfiles(userId, username);
  return { ok: true };
}
