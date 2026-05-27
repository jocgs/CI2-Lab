"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, upsertBet } from "@/lib/db";
import { outcomeFromGoals } from "@/lib/scoring";
import type { Outcome } from "@/types/domain";

export async function placeBetAction(formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  const outcome = String(formData.get("outcome") ?? "") as Outcome;
  const homeGoals = Number(formData.get("homeGoals") ?? NaN);
  const awayGoals = Number(formData.get("awayGoals") ?? NaN);

  if (
    !matchId ||
    !["1", "X", "2"].includes(outcome) ||
    !Number.isInteger(homeGoals) ||
    !Number.isInteger(awayGoals) ||
    homeGoals < 0 ||
    awayGoals < 0 ||
    outcomeFromGoals(homeGoals, awayGoals) !== outcome
  ) {
    throw new Error("Datos de porra inválidos");
  }

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  await upsertBet({
    userId,
    matchId,
    prediction: { outcome, homeGoals, awayGoals },
  });

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/ranking");
}
