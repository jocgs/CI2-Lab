"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, purchaseAvatar, setActiveAvatar } from "@/lib/db";

export type ShopActionResult = { ok: true } | { error: string };

export async function purchaseAvatarAction(avatarId: string): Promise<ShopActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  try {
    await purchaseAvatar(userId, avatarId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al comprar" };
  }

  revalidatePath("/tienda");
  revalidatePath("/profile");
  return { ok: true };
}

export async function setActiveAvatarAction(avatarId: string | null): Promise<ShopActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autenticado" };

  try {
    await setActiveAvatar(userId, avatarId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al activar avatar" };
  }

  revalidatePath("/tienda");
  revalidatePath("/profile");
  return { ok: true };
}
