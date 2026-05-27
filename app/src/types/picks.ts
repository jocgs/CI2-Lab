// ─── Tournament Special Picks ─────────────────────────────────────────────────

export type FinalStage =
  | "group_stage"
  | "round_of_16"
  | "quarter_finals"
  | "semi_finals"
  | "final"
  | "winner";

export interface TournamentTeam {
  id: string;
  name: string;
  flag?: string;
  /** Pre-tournament betting odds to win the championship (e.g. 6.00, 80.00) */
  marketOdds: number;
  group?: string;
  /** Stage reached at end of tournament (null = tournament not finished yet) */
  finalStage?: FinalStage | null;
}

export interface Tournament {
  id: string;
  name: string;
  /** ISO date string — when the tournament starts (picks locked after this) */
  startsAt: string;
  /** ISO date string — when odds are considered frozen (defaults to startsAt) */
  oddsLockedAt?: string;
}

export interface UserTournamentPicks {
  userId: string;
  tournamentId: string;
  revelationTeamId: string | null;
  /** @deprecated La decepción ahora se gestiona en las predicciones del equipo fantasy. */
  disappointmentTeamId?: string | null;
  createdAt: string;
  updatedAt: string;
}
