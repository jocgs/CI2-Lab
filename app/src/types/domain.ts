/**
 * Modelo de dominio de Porrify.
 *
 * Todas las entidades viven aquí para que tanto el frontend como un futuro
 * backend (Supabase) compartan los mismos contratos. Cuando conectemos la
 * BBDD real, estos tipos serán la "fuente de verdad" para validar las
 * respuestas de la API.
 */

export type ID = string;

// ---------------------------------------------------------------------------
// Competiciones, equipos y partidos (datos "externos" que vendrán de la API
// de fútbol el jueves; ahora son mocks).
// ---------------------------------------------------------------------------

export interface Competition {
  id: ID;
  name: string;
  shortName: string;
  season: string;
  logoUrl?: string;
}

export interface Team {
  id: ID;
  name: string;
  shortName: string;
  country: string;
  logoUrl?: string;
}

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

/** Resultado del partido en formato 1X2: local / empate / visitante. */
export type Outcome = "1" | "X" | "2";

export interface BetPrediction {
  outcome: Outcome;
  homeGoals: number;
  awayGoals: number;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  outcome: Outcome;
}

export interface Match {
  id: ID;
  competitionId: ID;
  homeTeamId: ID;
  awayTeamId: ID;
  kickoffAt: string; // ISO 8601
  status: MatchStatus;
  result?: MatchResult; // solo cuando status === "FINISHED"
}

// ---------------------------------------------------------------------------
// Usuarios y grupos (datos "propios" de la app que vivirán en Supabase).
// ---------------------------------------------------------------------------

export interface User {
  id: ID;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  friendIds?: ID[];
  friendRequestSentIds?: ID[];
  friendRequestReceivedIds?: ID[];
  supportedNationalTeamId?: ID;
  supportedTeamIds?: ID[];
  createdAt: string;
}

export interface Group {
  id: ID;
  name: string;
  /** Código corto que un amigo introduce para unirse. */
  inviteCode: string;
  ownerId: ID;
  memberIds: ID[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Porras (bets) y puntuación.
// ---------------------------------------------------------------------------

export type BetStatus = "PENDING" | "WON" | "LOST";

export interface Bet {
  id: ID;
  userId: ID;
  matchId: ID;
  prediction: BetPrediction;
  createdAt: string;
  status: BetStatus;
  /** Puntos otorgados una vez resuelto el partido. */
  points: number;
}

// ---------------------------------------------------------------------------
// Vistas derivadas (lo que el cliente normalmente consume).
// No se persisten: se calculan a partir de las entidades base.
// ---------------------------------------------------------------------------

export interface RankingEntry {
  userId: ID;
  username: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  correctBets: number;
  exactBets: number;
  totalBets: number;
  /** % de aciertos (0–100). */
  accuracy: number;
  /**
   * Cambio de posición respecto a la jornada anterior.
   * Positivo = subió puestos, negativo = bajó, 0 = sin cambio.
   */
  rankChange?: number;
}

export interface UserStreak {
  userId: ID;
  current: number;
  best: number;
}
