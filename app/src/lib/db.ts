/**
 * Capa de acceso a datos — base de datos local (archivos JSON en /data).
 * Toda la lógica de persistencia vive aquí; el resto de la app solo importa
 * estas funciones y no sabe dónde se guardan los datos.
 */

import * as store from "./local-store";
import { buildRanking, computeStreak, getPointsForBet } from "./scoring";
import { getSessionUser, getSessionUserId } from "./session";
import type {
  Bet,
  Competition,
  Group,
  Match,
  Outcome,
  RankingEntry,
  Team,
  User,
  UserStreak,
} from "@/types/domain";

const byKickoff = (a: Match, b: Match) =>
  new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  return getSessionUserId();
}

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
  return store.getAll<User>("users").map(stripPassword);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const u = store.getById<UserWithPassword>("users", id);
  return u ? stripPassword(u) : undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const u = store.findOneWhere<UserWithPassword>(
    "users",
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  return u ? stripPassword(u) : undefined;
}

export async function getFriendsForUser(userId: string): Promise<User[]> {
  const user = store.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  return (user.friendIds ?? [])
    .map((id) => store.getById<UserWithPassword>("users", id))
    .filter((u): u is UserWithPassword => Boolean(u))
    .map(stripPassword);
}

export async function getFriendRequestsReceived(userId: string): Promise<User[]> {
  const user = store.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  return (user.friendRequestReceivedIds ?? [])
    .map((id) => store.getById<UserWithPassword>("users", id))
    .filter((u): u is UserWithPassword => Boolean(u))
    .map(stripPassword);
}

export async function getFriendRequestsSent(userId: string): Promise<User[]> {
  const user = store.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  return (user.friendRequestSentIds ?? [])
    .map((id) => store.getById<UserWithPassword>("users", id))
    .filter((u): u is UserWithPassword => Boolean(u))
    .map(stripPassword);
}

export async function updateUserProfile(
  userId: string,
  input: {
    avatarUrl?: string | null;
    supportedNationalTeamId?: string | null;
    supportedTeamIds?: string[];
  }
): Promise<User> {
  const updated = store.update<UserWithPassword>("users", userId, {
    avatarUrl: input.avatarUrl?.trim() || undefined,
    supportedNationalTeamId: input.supportedNationalTeamId?.trim() || undefined,
    supportedTeamIds: (input.supportedTeamIds ?? []).filter(Boolean),
  });
  if (!updated) throw new Error("Usuario no encontrado");
  return stripPassword(updated);
}

export async function requestFriendByUsername(
  userId: string,
  username: string
): Promise<User> {
  const user = store.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const friend = store.findOneWhere<UserWithPassword>(
    "users",
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!friend) throw new Error("No existe ningún usuario con ese nombre");
  if (friend.id === user.id) throw new Error("No puedes añadirte a ti mismo");

  if ((user.friendIds ?? []).includes(friend.id)) return stripPassword(friend);

  const userSent = new Set(user.friendRequestSentIds ?? []);
  const userReceived = new Set(user.friendRequestReceivedIds ?? []);
  const friendReceived = new Set(friend.friendRequestReceivedIds ?? []);

  if (userSent.has(friend.id)) return stripPassword(friend);
  if (userReceived.has(friend.id))
    throw new Error("Ya te ha enviado una solicitud. Acepta desde tu perfil.");

  userSent.add(friend.id);
  friendReceived.add(user.id);

  store.update<UserWithPassword>("users", user.id, { friendRequestSentIds: [...userSent] });
  store.update<UserWithPassword>("users", friend.id, { friendRequestReceivedIds: [...friendReceived] });

  return stripPassword(friend);
}

export async function acceptFriendRequestByUsername(
  userId: string,
  username: string
): Promise<User> {
  const user = store.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const requester = store.findOneWhere<UserWithPassword>(
    "users",
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!requester) throw new Error("No existe ningún usuario con ese nombre");
  if (requester.id === user.id) throw new Error("No puedes aceptarte a ti mismo");

  const received = new Set(user.friendRequestReceivedIds ?? []);
  if (!received.has(requester.id))
    throw new Error("No tienes una solicitud pendiente de ese usuario");

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

  store.update<UserWithPassword>("users", user.id, {
    friendIds: [...userFriends],
    friendRequestReceivedIds: [...received],
    friendRequestSentIds: [...userSent],
  });
  store.update<UserWithPassword>("users", requester.id, {
    friendIds: [...requesterFriends],
    friendRequestReceivedIds: [...requesterReceived],
    friendRequestSentIds: [...requesterSent],
  });

  return stripPassword(requester);
}

export async function addFriendByUsername(userId: string, username: string): Promise<User> {
  return requestFriendByUsername(userId, username);
}

// ---------------------------------------------------------------------------
// Equipos y competiciones
// ---------------------------------------------------------------------------

export async function getTeams(): Promise<Team[]> {
  return store.getAll<Team>("teams");
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  return store.getById<Team>("teams", id);
}

export async function getCompetitions(): Promise<Competition[]> {
  return store.getAll<Competition>("competitions");
}

export async function getCompetitionById(id: string): Promise<Competition | undefined> {
  return store.getById<Competition>("competitions", id);
}

// ---------------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  return store.getAll<Match>("matches").sort(byKickoff);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  return store.getById<Match>("matches", id);
}

export async function getUpcomingMatches(): Promise<Match[]> {
  return store
    .findWhere<Match>("matches", (m) => m.status === "SCHEDULED" || m.status === "LIVE")
    .sort(byKickoff);
}

export async function getFinishedMatches(): Promise<Match[]> {
  return store
    .findWhere<Match>("matches", (m) => m.status === "FINISHED")
    .sort(byKickoff);
}

// ---------------------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------------------

export async function getGroupById(id: string): Promise<Group | undefined> {
  return store.getById<Group>("groups", id);
}

export async function getGroupsForUser(userId: string): Promise<Group[]> {
  return store.findWhere<Group>("groups", (g) => g.memberIds.includes(userId));
}

export async function createGroup(input: {
  name: string;
  ownerId: string;
}): Promise<Group> {
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const group: Group = {
    id: `group_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    inviteCode,
    ownerId: input.ownerId,
    memberIds: [input.ownerId],
    createdAt: new Date().toISOString(),
  };
  return store.insert("groups", group);
}

export async function joinGroup(code: string, userId: string): Promise<Group | null> {
  const group = store.findOneWhere<Group>(
    "groups",
    (g) => g.inviteCode === code.toUpperCase()
  );
  if (!group) return null;

  if (!group.memberIds.includes(userId)) {
    const updated = store.update<Group>("groups", group.id, {
      memberIds: [...group.memberIds, userId],
    });
    return updated ?? null;
  }
  return group;
}

// ---------------------------------------------------------------------------
// Porras
// ---------------------------------------------------------------------------

export async function getBetsForUser(userId: string): Promise<Bet[]> {
  return store.findWhere<Bet>("bets", (b) => b.userId === userId);
}

export async function getBetsForMatch(matchId: string): Promise<Bet[]> {
  return store.findWhere<Bet>("bets", (b) => b.matchId === matchId);
}

export async function getBetForUserAndMatch(
  userId: string,
  matchId: string
): Promise<Bet | undefined> {
  return store.findOneWhere<Bet>(
    "bets",
    (b) => b.userId === userId && b.matchId === matchId
  );
}

export async function upsertBet(input: {
  userId: string;
  matchId: string;
  prediction: { outcome: Outcome; homeGoals: number; awayGoals: number };
}): Promise<Bet> {
  const existing = store.findOneWhere<Bet>(
    "bets",
    (b) => b.userId === input.userId && b.matchId === input.matchId
  );

  if (existing) {
    const updated = store.update<Bet>("bets", existing.id, {
      prediction: input.prediction,
      createdAt: new Date().toISOString(),
    });
    return updated!;
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
  return store.insert("bets", newBet);
}

// ---------------------------------------------------------------------------
// Vistas derivadas
// ---------------------------------------------------------------------------

export async function getGlobalRanking(): Promise<RankingEntry[]> {
  const [users, bets, matches] = await Promise.all([
    getUsers(),
    store.getAll<Bet>("bets"),
    getMatches(),
  ]);
  return buildRanking(users, bets, matches);
}

export async function getGroupRanking(groupId: string): Promise<RankingEntry[]> {
  const group = await getGroupById(groupId);
  if (!group) return [];
  const [users, bets, matches] = await Promise.all([
    getUsers(),
    store.getAll<Bet>("bets"),
    getMatches(),
  ]);
  const members = users.filter((u) => group.memberIds.includes(u.id));
  return buildRanking(members, bets, matches);
}

export async function getStreakForUser(userId: string): Promise<UserStreak> {
  const [bets, matches] = await Promise.all([
    getBetsForUser(userId),
    getMatches(),
  ]);
  return computeStreak(userId, bets, matches);
}

// ---------------------------------------------------------------------------
// Resolución de porras
// ---------------------------------------------------------------------------

export async function resolveFinishedBets(
  matches: Match[]
): Promise<{ resolved: number }> {
  const finishedById = new Map(
    matches
      .filter((m) => m.status === "FINISHED" && m.result)
      .map((m) => [m.id, m])
  );
  if (finishedById.size === 0) return { resolved: 0 };

  const pending = store.findWhere<Bet>("bets", (b) => b.status === "PENDING");
  let resolved = 0;

  for (const bet of pending) {
    const match = finishedById.get(bet.matchId);
    if (!match?.result) continue;
    const points = getPointsForBet(bet, match);
    store.update<Bet>("bets", bet.id, {
      status: points > 0 ? "WON" : "LOST",
      points,
    });
    resolved++;
  }

  return { resolved };
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

type UserWithPassword = User & { passwordHash?: string };

function stripPassword(u: UserWithPassword): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _pw, ...user } = u;
  return user as User;
}
