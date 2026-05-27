import type { TournamentTeam, Tournament, FinalStage } from "@/types/picks";

// ─── Configurable thresholds ─────────────────────────────────────────────────
// These can be overridden per-tournament in future versions.

export const REVELATION_MIN_ODDS = 40;
export const DISAPPOINTMENT_MAX_ODDS = 25;

// ─── Filtering ────────────────────────────────────────────────────────────────

/**
 * Returns teams eligible as "revelation" (underdog with high odds).
 * Sorted ascending by odds (lowest eligible first).
 */
export function getEligibleRevelationTeams(teams: TournamentTeam[]): TournamentTeam[] {
  return teams
    .filter((t) => t.marketOdds >= REVELATION_MIN_ODDS)
    .sort((a, b) => a.marketOdds - b.marketOdds);
}

/**
 * Returns teams eligible as "disappointment" (favourite expected to fail).
 * Sorted ascending by odds (biggest favourite first).
 */
export function getEligibleDisappointmentTeams(teams: TournamentTeam[]): TournamentTeam[] {
  return teams
    .filter((t) => t.marketOdds <= DISAPPOINTMENT_MAX_ODDS)
    .sort((a, b) => a.marketOdds - b.marketOdds);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface PicksValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateSpecialPicks(params: {
  revelationTeamId: string | null;
  teams: TournamentTeam[];
}): PicksValidationResult {
  const { revelationTeamId, teams } = params;

  if (!revelationTeamId) {
    return { valid: false, error: "Debes elegir una selección revelación." };
  }

  const revelationTeam = teams.find((t) => t.id === revelationTeamId);
  if (!revelationTeam) {
    return { valid: false, error: "La selección elegida no existe." };
  }

  if (revelationTeam.marketOdds < REVELATION_MIN_ODDS) {
    return {
      valid: false,
      error: `La selección revelación debe tener una cuota igual o superior a ${REVELATION_MIN_ODDS}.`,
    };
  }

  return { valid: true, error: null };
}

// ─── Tournament lock check ────────────────────────────────────────────────────

export function isTournamentLocked(tournament: Tournament): boolean {
  const lockedAt = tournament.oddsLockedAt ?? tournament.startsAt;
  return new Date() >= new Date(lockedAt);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Points earned for the "revelation" pick based on how far the team advances.
 * Rewards exceeding expectations: further they go, more points.
 */
export function calculateRevelationPoints(finalStage: FinalStage): number {
  switch (finalStage) {
    case "group_stage":  return 0;
    case "round_of_16":  return 5;
    case "quarter_finals": return 15;
    case "semi_finals":  return 25;
    case "final":        return 40;
    case "winner":       return 60;
    default:             return 0;
  }
}

/**
 * Points earned for the "disappointment" pick based on how early the team exits.
 * Rewards early exits; penalises if they actually succeed.
 */
export function calculateDisappointmentPoints(finalStage: FinalStage): number {
  switch (finalStage) {
    case "group_stage":  return 30;
    case "round_of_16":  return 20;
    case "quarter_finals": return 10;
    case "semi_finals":  return 0;
    case "final":        return -10;
    case "winner":       return -25;
    default:             return 0;
  }
}

/** Combined score for a user's special picks once the tournament ends. */
export function calculateSpecialPicksTotal(
  revelationStage: FinalStage | null | undefined,
  disappointmentStage: FinalStage | null | undefined,
): number {
  return (
    (revelationStage ? calculateRevelationPoints(revelationStage) : 0) +
    (disappointmentStage ? calculateDisappointmentPoints(disappointmentStage) : 0)
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function stageLabelEs(stage: FinalStage): string {
  const labels: Record<FinalStage, string> = {
    group_stage: "Fase de grupos",
    round_of_16: "Octavos de final",
    quarter_finals: "Cuartos de final",
    semi_finals: "Semifinales",
    final: "Final",
    winner: "Campeón 🏆",
  };
  return labels[stage];
}
