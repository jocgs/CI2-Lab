/**
 * Ball mood state machine.
 *
 * Rules:
 * - Default: Normal
 * - Below Normal → each win moves up ONE level (Muy Triste→Triste, Triste→Normal)
 * - At Normal or above → consecutive wins needed (3 = Feliz, 5+ = Muy Feliz)
 * - Above Normal → each loss moves down ONE level (Muy Feliz→Feliz, Feliz→Normal)
 * - At Normal or below → consecutive losses needed (3 = Triste, 5+ = Muy Triste)
 * - Consecutive counters reset when a recovery step happens
 */

export type Mood = "muy-triste" | "triste" | "normal" | "feliz" | "muy-feliz";

export function computeMood(
  bets: { status: string }[],
): Mood {
  const completed = bets.filter(
    (b) => b.status === "WON" || b.status === "LOST",
  );

  let mood: Mood = "normal";
  let consecutiveWins = 0;
  let consecutiveLosses = 0;

  for (const bet of completed) {
    if (bet.status === "WON") {
      consecutiveLosses = 0;
      consecutiveWins++;

      if (mood === "muy-triste") {
        // Recovery: one step up, reset win counter
        mood = "triste";
        consecutiveWins = 0;
      } else if (mood === "triste") {
        // Recovery: one step up, reset win counter
        mood = "normal";
        consecutiveWins = 0;
      } else {
        // Normal or above: thresholds apply
        if (consecutiveWins >= 5) mood = "muy-feliz";
        else if (consecutiveWins >= 3) mood = "feliz";
        // 1–2 wins: stay at current level (normal / feliz / muy-feliz)
      }
    } else {
      consecutiveWins = 0;
      consecutiveLosses++;

      if (mood === "muy-feliz") {
        // Penalty: one step down, reset loss counter
        mood = "feliz";
        consecutiveLosses = 0;
      } else if (mood === "feliz") {
        // Penalty: one step down, reset loss counter
        mood = "normal";
        consecutiveLosses = 0;
      } else {
        // Normal or below: thresholds apply
        if (consecutiveLosses >= 5) mood = "muy-triste";
        else if (consecutiveLosses >= 3) mood = "triste";
        // 1–2 losses: stay at current level (normal / triste / muy-triste)
      }
    }
  }

  return mood;
}

export function moodToImage(mood: Mood): string {
  const map: Record<Mood, string> = {
    "muy-triste": "/bolines/bolin-muy-triste.png",
    "triste":     "/bolines/bolin-triste.png",
    "normal":     "/bolines/bolin-normal.png",
    "feliz":      "/bolines/bolin-feliz.png",
    "muy-feliz":  "/bolines/bolin-muy-feliz.png",
  };
  return map[mood];
}
