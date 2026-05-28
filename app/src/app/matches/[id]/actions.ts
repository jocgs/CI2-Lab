"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, upsertBet } from "@/lib/db";
import { outcomeFromGoals } from "@/lib/scoring";
import type { Outcome } from "@/types/domain";

export type BetActionState =
  | null
  | { ok: true; homeGoals: number; awayGoals: number; outcome: Outcome }
  | { ok: false; error: string };

export async function placeBetAction(
  _prev: BetActionState,
  formData: FormData
): Promise<BetActionState> {
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
    return { ok: false, error: "Datos de porra inválidos" };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "No autenticado" };

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

  return { ok: true, homeGoals, awayGoals, outcome };
}
