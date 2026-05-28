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

export function getUserByUsername(username: string): User | undefined {
  return MOCK_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function getFriendsForUser(userId: string): User[] {
  const user = getUserById(userId);
  if (!user) return [];
  return (user.friendIds ?? [])
    .map((friendId) => getUserById(friendId))
    .filter((friend): friend is User => Boolean(friend));
}

export function getFriendRequestsReceived(userId: string): User[] {
  const user = getUserById(userId);
  if (!user) return [];
  return (user.friendRequestReceivedIds ?? [])
    .map((requestId) => getUserById(requestId))
    .filter((request): request is User => Boolean(request));
}

export function getFriendRequestsSent(userId: string): User[] {
  const user = getUserById(userId);
  if (!user) return [];
  return (user.friendRequestSentIds ?? [])
    .map((requestId) => getUserById(requestId))
    .filter((request): request is User => Boolean(request));
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

export function updateUserProfile(
  userId: string,
  input: {
    avatarUrl?: string | null;
    supportedNationalTeamId?: string | null;
    supportedTeamIds?: string[];
  },
): User {
  const user = getUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  user.avatarUrl = input.avatarUrl?.trim() || undefined;
  user.supportedNationalTeamId = input.supportedNationalTeamId?.trim() || undefined;
  user.supportedTeamIds = (input.supportedTeamIds ?? []).filter(Boolean);

  return user;
}

export function requestFriendByUsername(userId: string, username: string): User {
  const user = getUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const friend = getUserByUsername(username.trim());
  if (!friend) throw new Error("No existe ningún usuario con ese nombre");
  if (friend.id === user.id) throw new Error("No puedes añadirte a ti mismo");

  if ((user.friendIds ?? []).includes(friend.id)) {
    throw new Error("Ya es amigo tuyo");
  }

  const userSent = new Set(user.friendRequestSentIds ?? []);
  const userReceived = new Set(user.friendRequestReceivedIds ?? []);
  const friendReceived = new Set(friend.friendRequestReceivedIds ?? []);

  if (userSent.has(friend.id)) {
    return friend;
  }

  if (userReceived.has(friend.id)) {
    throw new Error("Ya te ha enviado una solicitud. Acepta desde tu perfil.");
  }

  userSent.add(friend.id);
  friendReceived.add(user.id);

  user.friendRequestSentIds = [...userSent];
  friend.friendRequestReceivedIds = [...friendReceived];

  return friend;
}

export function acceptFriendRequestByUsername(userId: string, username: string): User {
  const user = getUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const requester = getUserByUsername(username.trim());
  if (!requester) throw new Error("No existe ningún usuario con ese nombre");
  if (requester.id === user.id) throw new Error("No puedes aceptarte a ti mismo");

  const received = new Set(user.friendRequestReceivedIds ?? []);
  if (!received.has(requester.id)) {
    throw new Error("No tienes una solicitud pendiente de ese usuario");
  }

  const userFriends = new Set(user.friendIds ?? []);
  const requesterFriends = new Set(requester.friendIds ?? []);
  const userSent = new Set(user.friendRequestSentIds ?? []);
  const requesterReceived = new Set(requester.friendRequestReceivedIds ?? []);
  const requesterSent = new Set(requester.friendRequestSentIds ?? []);

  userFriends.add(requester.id);
  requesterFriends.add(user.id);
  received.delete(requester.id);
  userSent.delete(requester.id);
  requesterReceived.delete(user.id);
  requesterSent.delete(user.id);

  user.friendIds = [...userFriends];
  user.friendRequestReceivedIds = [...received];
  user.friendRequestSentIds = [...userSent];
  requester.friendIds = [...requesterFriends];
  requester.friendRequestReceivedIds = [...requesterReceived];
  requester.friendRequestSentIds = [...requesterSent];

  return requester;
}

export function addFriendByUsername(userId: string, username: string): User {
  return requestFriendByUsername(userId, username);
}

// ---------------------------------------------------------------------------
// Vistas derivadas
// ---------------------------------------------------------------------------

/** Ranking global: todos los usuarios. */
export function getGlobalRanking(rankChanges?: Record<string, number>): RankingEntry[] {
  return buildRanking(MOCK_USERS, bets, MOCK_MATCHES, rankChanges);
}

/** Ranking dentro de un grupo: solo sus miembros. */
export function getGroupRanking(groupId: string, rankChanges?: Record<string, number>): RankingEntry[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  const members = MOCK_USERS.filter((u) => group.memberIds.includes(u.id));
  return buildRanking(members, bets, MOCK_MATCHES, rankChanges);
}

export function getStreakForUser(userId: string): UserStreak {
  return computeStreak(userId, bets, MOCK_MATCHES);
}
