"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, upsertBet } from "@/lib/db";
import type { Outcome } from "@/types/domain";

export async function placeBetAction(formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  const prediction = String(formData.get("prediction") ?? "") as Outcome;

  if (!matchId || !["1", "X", "2"].includes(prediction)) {
    throw new Error("Datos de porra inválidos");
  }

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  await upsertBet({ userId, matchId, prediction });

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/ranking");
}
