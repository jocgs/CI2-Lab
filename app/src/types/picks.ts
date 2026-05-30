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
  /** Escudo local en /imagenes/national-crests/ */
  crestUrl?: string;
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
  /** Balón de oro — mejor jugador del torneo. */
  ballonDOrPlayerId?: string | null;
  /** Bota de oro — máximo goleador. */
  goldenBootPlayerId?: string | null;
  /** Guante de oro — mejor portero. */
  goldenGlovePlayerId?: string | null;
  /** Mejor jugador joven del torneo. */
  bestYoungPlayerId?: string | null;
  /** Máximo asistente del torneo. */
  topAssistPlayerId?: string | null;
  /** Selección cuyo gol será el mejor del torneo. */
  bestGoalTeamId?: string | null;
  /** Mejor selección en fase de grupos. */
  bestGroupStageTeamId?: string | null;
  /** Peor selección en fase de grupos. */
  worstGroupStageTeamId?: string | null;
  /** Mejor selección fuera de UEFA y CONMEBOL. */
  bestNonUefaConmebolTeamId?: string | null;
  createdAt: string;
  updatedAt: string;
}
