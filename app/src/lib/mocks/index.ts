/**
 * Capa de acceso a datos mock.
 *
 * IDEA CLAVE: las páginas/componentes consumen SOLO las funciones de este
 * módulo (`getMatches`, `getGroup`, etc.). Cuando metamos Supabase el
 * miércoles/jueves, solo cambiamos la implementación aquí dentro y el resto
 * de la app no se entera. Funciona como repositorio.
 */

import type {
  Bet,
  Group,
  Match,
  Outcome,
  RankingEntry,
  Team,
  User,
  UserStreak,
} from "@/types/domain";

import { MOCK_COMPETITIONS } from "./competitions";
import { MOCK_TEAMS } from "./teams";
import { MOCK_MATCHES } from "./matches";
import { MOCK_USERS, getCurrentUser, CURRENT_USER_ID } from "./users";
import { MOCK_GROUPS } from "./groups";
import { MOCK_BETS } from "./bets";

import { buildRanking, computeStreak } from "@/lib/scoring";

// Las porras se mantienen en memoria para que las acciones del usuario
// (apostar) se reflejen durante la sesión. Se reinician al recargar.
const bets: Bet[] = [...MOCK_BETS];

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export { getCurrentUser, CURRENT_USER_ID };

export function getUsers(): User[] {
  return MOCK_USERS;
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getTeams(): Team[] {
  return MOCK_TEAMS;
}

export function getTeamById(id: string): Team | undefined {
  return MOCK_TEAMS.find((t) => t.id === id);
}

export function getCompetitions() {
  return MOCK_COMPETITIONS;
}

export function getCompetitionById(id: string) {
  return MOCK_COMPETITIONS.find((c) => c.id === id);
}

export function getMatches(): Match[] {
  return MOCK_MATCHES.slice().sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
  );
}

export function getMatchById(id: string): Match | undefined {
  return MOCK_MATCHES.find((m) => m.id === id);
}

export function getUpcomingMatches(): Match[] {
  return getMatches().filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
}

export function getFinishedMatches(): Match[] {
  return getMatches().filter((m) => m.status === "FINISHED");
}

export function getGroups(): Group[] {
  return MOCK_GROUPS;
}

export function getGroupById(id: string): Group | undefined {
  return MOCK_GROUPS.find((g) => g.id === id);
}

export function getGroupsForUser(userId: string): Group[] {
  return MOCK_GROUPS.filter((g) => g.memberIds.includes(userId));
}

export function getBets(): Bet[] {
  return bets;
}

export function getBetsForUser(userId: string): Bet[] {
  return bets.filter((b) => b.userId === userId);
}

export function getBetsForMatch(matchId: string): Bet[] {
  return bets.filter((b) => b.matchId === matchId);
}

export function getBetForUserAndMatch(userId: string, matchId: string): Bet | undefined {
  return bets.find((b) => b.userId === userId && b.matchId === matchId);
}

// ---------------------------------------------------------------------------
// Writes (mock)
// ---------------------------------------------------------------------------

/**
 * Crea o actualiza la porra del usuario para un partido. En esta capa mock
 * trabajamos en memoria; cuando haya backend será un `INSERT ... ON CONFLICT`
 * en Supabase.
 */
export function upsertBet(input: {
  userId: string;
  matchId: string;
  prediction: { outcome: Outcome; homeGoals: number; awayGoals: number };
}): Bet {
  const existing = bets.find(
    (b) => b.userId === input.userId && b.matchId === input.matchId,
  );

  if (existing) {
    existing.prediction = input.prediction;
    existing.createdAt = new Date().toISOString();
    return existing;
  }

  const newBet: Bet = {
    id: `bet_${Math.random().toString(36).slice(2, 10)}`,
    userId: input.userId,
    matchId: input.matchId,
    prediction: input.prediction,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    points: 0,
  };
  bets.push(newBet);
  return newBet;
}

// ---------------------------------------------------------------------------
// Vistas derivadas
// ---------------------------------------------------------------------------

/** Ranking global: todos los usuarios. */
export function getGlobalRanking(): RankingEntry[] {
  return buildRanking(MOCK_USERS, bets, MOCK_MATCHES);
}

/** Ranking dentro de un grupo: solo sus miembros. */
export function getGroupRanking(groupId: string): RankingEntry[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  const members = MOCK_USERS.filter((u) => group.memberIds.includes(u.id));
  return buildRanking(members, bets, MOCK_MATCHES);
}

export function getStreakForUser(userId: string): UserStreak {
  return computeStreak(userId, bets, MOCK_MATCHES);
}
