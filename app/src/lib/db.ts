/**
 * Capa de acceso a datos — Firestore (Firebase Admin SDK).
 * El resto de la app solo importa estas funciones.
 */

import * as fs from "./data-store";
import { usesLocalStore } from "./data-store";
import { buildRanking, computeStreak, getPointsForBet } from "./scoring";
import { getSessionUser, getSessionUserId } from "./session";
import { adminDb } from "./firebase-admin";
import { getShopAvatarById, COINS_PER_POINT } from "./shop-avatars";
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

type UserWithPassword = User & { passwordHash?: string; email?: string };

function stripPassword(u: UserWithPassword): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _pw, ...user } = u;
  return user as User;
}

export async function getUsers(): Promise<User[]> {
  const all = await fs.getAll<UserWithPassword>("users");
  return all.map(stripPassword);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const u = await fs.getById<UserWithPassword>("users", id);
  return u ? stripPassword(u) : undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const u = await fs.queryWhereOne<UserWithPassword>("users", "username", username.trim().toLowerCase());
  return u ? stripPassword(u) : undefined;
}

export async function getFriendsForUser(userId: string): Promise<User[]> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  const ids = user.friendIds ?? [];
  const friends = await Promise.all(ids.map((id) => fs.getById<UserWithPassword>("users", id)));
  return friends
    .filter((u): u is UserWithPassword => Boolean(u))
    .map(stripPassword);
}

export async function getFriendRequestsReceived(userId: string): Promise<User[]> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  const ids = user.friendRequestReceivedIds ?? [];
  const users = await Promise.all(ids.map((id) => fs.getById<UserWithPassword>("users", id)));
  return users.filter((u): u is UserWithPassword => Boolean(u)).map(stripPassword);
}

export async function getFriendRequestsSent(userId: string): Promise<User[]> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) return [];
  const ids = user.friendRequestSentIds ?? [];
  const users = await Promise.all(ids.map((id) => fs.getById<UserWithPassword>("users", id)));
  return users.filter((u): u is UserWithPassword => Boolean(u)).map(stripPassword);
}

export async function updateUserProfile(
  userId: string,
  input: {
    avatarUrl?: string | null;
    supportedNationalTeamId?: string | null;
    supportedTeamIds?: string[];
    profileThemeId?: string | null;
  },
): Promise<User> {
  await fs.patch("users", userId, {
    avatarUrl: input.avatarUrl?.trim() || null,
    supportedNationalTeamId: input.supportedNationalTeamId?.trim() || null,
    supportedTeamIds: (input.supportedTeamIds ?? []).filter(Boolean),
    ...(input.profileThemeId !== undefined
      ? { profileThemeId: input.profileThemeId?.trim() || "default" }
      : {}),
  });
  const updated = await fs.getById<UserWithPassword>("users", userId);
  if (!updated) throw new Error("Usuario no encontrado");
  return stripPassword(updated);
}

export async function requestFriendByUsername(userId: string, username: string): Promise<User> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const friend = await fs.queryWhereOne<UserWithPassword>("users", "username", username.trim().toLowerCase());
  if (!friend) throw new Error("No existe ningún usuario con ese nombre");
  if (friend.id === user.id) throw new Error("No puedes añadirte a ti mismo");

  if ((user.friendIds ?? []).includes(friend.id)) {
    throw new Error("Ya es amigo tuyo");
  }

  const userSent = new Set(user.friendRequestSentIds ?? []);
  const userReceived = new Set(user.friendRequestReceivedIds ?? []);
  const friendReceived = new Set(friend.friendRequestReceivedIds ?? []);

  if (userSent.has(friend.id)) return stripPassword(friend);
  if (userReceived.has(friend.id))
    throw new Error("Ya te ha enviado una solicitud. Acepta desde tu perfil.");

  userSent.add(friend.id);
  friendReceived.add(user.id);

  await Promise.all([
    fs.patch("users", user.id, { friendRequestSentIds: [...userSent] }),
    fs.patch("users", friend.id, { friendRequestReceivedIds: [...friendReceived] }),
  ]);

  return stripPassword(friend);
}

export async function acceptFriendRequestByUsername(userId: string, username: string): Promise<User> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const requester = await fs.queryWhereOne<UserWithPassword>("users", "username", username.trim().toLowerCase());
  if (!requester) throw new Error("No existe ningún usuario con ese nombre");
  if (requester.id === user.id) throw new Error("No puedes aceptarte a ti mismo");

  const received = new Set(user.friendRequestReceivedIds ?? []);
  if (!received.has(requester.id))
    throw new Error("No tienes una solicitud pendiente de ese usuario");

  const userFriends      = new Set(user.friendIds ?? []);
  const requesterFriends = new Set(requester.friendIds ?? []);
  const userSent         = new Set(user.friendRequestSentIds ?? []);
  const requesterReceived = new Set(requester.friendRequestReceivedIds ?? []);
  const requesterSent    = new Set(requester.friendRequestSentIds ?? []);

  userFriends.add(requester.id);
  requesterFriends.add(user.id);
  received.delete(requester.id);
  userSent.delete(requester.id);
  requesterReceived.delete(user.id);
  requesterSent.delete(user.id);

  await Promise.all([
    fs.patch("users", user.id, {
      friendIds: [...userFriends],
      friendRequestReceivedIds: [...received],
      friendRequestSentIds: [...userSent],
    }),
    fs.patch("users", requester.id, {
      friendIds: [...requesterFriends],
      friendRequestReceivedIds: [...requesterReceived],
      friendRequestSentIds: [...requesterSent],
    }),
  ]);

  return stripPassword(requester);
}

export async function addFriendByUsername(userId: string, username: string): Promise<User> {
  return requestFriendByUsername(userId, username);
}

export async function removeFriendByUsername(userId: string, username: string): Promise<User> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const friend = await fs.queryWhereOne<UserWithPassword>("users", "username", username.trim().toLowerCase());
  if (!friend) throw new Error("No existe ningún usuario con ese nombre");
  if (friend.id === user.id) throw new Error("No puedes eliminarte a ti mismo");

  // Quitamos la amistad en ambos sentidos y limpiamos cualquier solicitud
  // pendiente que pudiera quedar entre los dos usuarios.
  const userFriends         = new Set(user.friendIds ?? []);
  const friendFriends       = new Set(friend.friendIds ?? []);
  const userSent            = new Set(user.friendRequestSentIds ?? []);
  const userReceived        = new Set(user.friendRequestReceivedIds ?? []);
  const friendSent          = new Set(friend.friendRequestSentIds ?? []);
  const friendReceived      = new Set(friend.friendRequestReceivedIds ?? []);

  if (!userFriends.has(friend.id)) throw new Error("No sois amigos");

  userFriends.delete(friend.id);
  friendFriends.delete(user.id);
  userSent.delete(friend.id);
  userReceived.delete(friend.id);
  friendSent.delete(user.id);
  friendReceived.delete(user.id);

  await Promise.all([
    fs.patch("users", user.id, {
      friendIds: [...userFriends],
      friendRequestSentIds: [...userSent],
      friendRequestReceivedIds: [...userReceived],
    }),
    fs.patch("users", friend.id, {
      friendIds: [...friendFriends],
      friendRequestSentIds: [...friendSent],
      friendRequestReceivedIds: [...friendReceived],
    }),
  ]);

  return stripPassword(friend);
}

// ---------------------------------------------------------------------------
// Equipos y competiciones
// ---------------------------------------------------------------------------

export async function getTeams(): Promise<Team[]> {
  return fs.getAll<Team>("teams");
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  return fs.getById<Team>("teams", id);
}

export async function getCompetitions(): Promise<Competition[]> {
  return fs.getAll<Competition>("competitions");
}

export async function getCompetitionById(id: string): Promise<Competition | undefined> {
  return fs.getById<Competition>("competitions", id);
}

// ---------------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  const all = await fs.getAll<Match>("matches");
  return all.sort(byKickoff);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  return fs.getById<Match>("matches", id);
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const all = await fs.queryWhereIn<Match>("matches", "status", ["SCHEDULED", "LIVE"]);
  return all.sort(byKickoff);
}

export async function getFinishedMatches(): Promise<Match[]> {
  const all = await fs.queryWhere<Match>("matches", "status", "FINISHED");
  return all.sort(byKickoff);
}

// ---------------------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------------------

export async function getGroupById(id: string): Promise<Group | undefined> {
  return fs.getById<Group>("groups", id);
}

export async function getGroupsForUser(userId: string): Promise<Group[]> {
  return fs.queryWhereArrayContains<Group>("groups", "memberIds", userId);
}

export async function createGroup(input: { name: string; ownerId: string }): Promise<Group> {
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const now = new Date().toISOString();
  const group: Group = {
    id: `group_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    inviteCode,
    ownerId: input.ownerId,
    memberIds: [input.ownerId],
    memberJoinedAt: { [input.ownerId]: now },
    createdAt: now,
  };
  return fs.insert("groups", group);
}

export async function joinGroup(code: string, userId: string): Promise<Group | null> {
  const group = await fs.queryWhereOne<Group>("groups", "inviteCode", code.toUpperCase());
  if (!group) return null;
  if (!group.memberIds.includes(userId)) {
    const now = new Date().toISOString();
    const newMemberJoinedAt = { ...(group.memberJoinedAt ?? {}), [userId]: now };
    await fs.patch("groups", group.id, {
      memberIds: [...group.memberIds, userId],
      memberJoinedAt: newMemberJoinedAt,
    });
    return { ...group, memberIds: [...group.memberIds, userId], memberJoinedAt: newMemberJoinedAt };
  }
  return group;
}

// ---------------------------------------------------------------------------
// Porras
// ---------------------------------------------------------------------------

export async function getBetsForUser(userId: string): Promise<Bet[]> {
  return fs.queryWhere<Bet>("bets", "userId", userId);
}

export async function getBetsForMatch(matchId: string): Promise<Bet[]> {
  return fs.queryWhere<Bet>("bets", "matchId", matchId);
}

export async function getBetForUserAndMatch(userId: string, matchId: string): Promise<Bet | undefined> {
  return fs.queryWhereCompoundOne<Bet>("bets", [["userId", userId], ["matchId", matchId]]);
}

export async function upsertBet(input: {
  userId: string;
  matchId: string;
  prediction: { outcome: Outcome; homeGoals: number; awayGoals: number };
}): Promise<Bet> {
  const existing = await getBetForUserAndMatch(input.userId, input.matchId);
  if (existing) {
    await fs.patch("bets", existing.id, {
      prediction: input.prediction,
      createdAt: new Date().toISOString(),
    });
    return { ...existing, prediction: input.prediction };
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
  return fs.insert("bets", newBet);
}

// ---------------------------------------------------------------------------
// Vistas derivadas
// ---------------------------------------------------------------------------

export async function getGlobalRanking(): Promise<RankingEntry[]> {
  const [users, bets, matches] = await Promise.all([
    getUsers(),
    fs.getAll<Bet>("bets"),
    getMatches(),
  ]);
  return buildRanking(users, bets, matches);
}

export async function getGroupRanking(groupId: string): Promise<RankingEntry[]> {
  const group = await getGroupById(groupId);
  if (!group) return [];
  const [users, bets, matches] = await Promise.all([
    getUsers(),
    fs.getAll<Bet>("bets"),
    getMatches(),
  ]);
  const members = users.filter((u) => group.memberIds.includes(u.id));

  // Para cada miembro, calculamos desde qué fecha cuentan sus porras.
  // Si el grupo no tiene el dato (datos legacy), se usa la fecha de creación
  // del grupo como punto de corte conservador.
  const memberSince: Record<string, string> = {};
  for (const member of members) {
    memberSince[member.id] =
      group.memberJoinedAt?.[member.id] ?? group.createdAt;
  }

  return buildRanking(members, bets, matches, undefined, memberSince);
}

export async function getStreakForUser(userId: string): Promise<UserStreak> {
  const [bets, matches] = await Promise.all([getBetsForUser(userId), getMatches()]);
  return computeStreak(userId, bets, matches);
}

// ---------------------------------------------------------------------------
// Tienda de avatares y monedas
// ---------------------------------------------------------------------------

export async function purchaseAvatar(userId: string, avatarId: string): Promise<User> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  const avatar = getShopAvatarById(avatarId);
  if (!avatar) throw new Error("Avatar no encontrado");

  const unlocked = user.unlockedAvatarIds ?? [];
  if (unlocked.includes(avatarId)) throw new Error("Ya tienes este avatar");

  const coins = user.coins ?? 0;
  if (coins < avatar.priceCoin) {
    throw new Error(`No tienes suficientes monedas. Necesitas ${avatar.priceCoin} y tienes ${coins}`);
  }

  await fs.patch("users", userId, {
    coins: coins - avatar.priceCoin,
    unlockedAvatarIds: [...unlocked, avatarId],
  });

  const updated = await fs.getById<UserWithPassword>("users", userId);
  if (!updated) throw new Error("Usuario no encontrado");
  return stripPassword(updated);
}

export async function setActiveAvatar(userId: string, avatarId: string | null): Promise<User> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) throw new Error("Usuario no encontrado");

  if (avatarId !== null) {
    const unlocked = user.unlockedAvatarIds ?? [];
    if (!unlocked.includes(avatarId)) throw new Error("No tienes ese avatar desbloqueado");
  }

  await fs.patch("users", userId, { activeAvatarId: avatarId });

  const updated = await fs.getById<UserWithPassword>("users", userId);
  if (!updated) throw new Error("Usuario no encontrado");
  return stripPassword(updated);
}

export async function awardCoins(userId: string, points: number): Promise<void> {
  const user = await fs.getById<UserWithPassword>("users", userId);
  if (!user) return;
  const current = user.coins ?? 0;
  await fs.patch("users", userId, { coins: current + points * COINS_PER_POINT });
}

// ---------------------------------------------------------------------------
// Resolución de porras
// ---------------------------------------------------------------------------

/** Tras actualizar puntos, registra victorias de grupo cuando cambia el líder del ranking. */
export async function recordGroupLeaderWins(): Promise<void> {
  const groups = await fs.getAll<Group>("groups");
  if (groups.length === 0) return;

  for (const group of groups) {
    const ranking = await getGroupRanking(group.id);
    const leader = ranking[0];
    if (!leader || leader.totalPoints <= 0) continue;

    const newLeaderId = leader.userId;
    if (group.lastLeaderId === newLeaderId) continue;

    await fs.patch("groups", group.id, { lastLeaderId: newLeaderId });

    const leaderUser = await fs.getById<UserWithPassword>("users", newLeaderId);
    if (!leaderUser) continue;

    const prevWins = leaderUser.groupLeaderWinCount ?? 0;
    await fs.patch("users", newLeaderId, { groupLeaderWinCount: prevWins + 1 });
  }
}

export async function resolveFinishedBets(matches: Match[]): Promise<{ resolved: number }> {
  const finishedById = new Map(
    matches
      .filter((m) => m.status === "FINISHED" && m.result)
      .map((m) => [m.id, m]),
  );
  if (finishedById.size === 0) return { resolved: 0 };

  const pending = await fs.queryWhere<Bet>("bets", "status", "PENDING");
  let resolved = 0;

  if (usesLocalStore) {
    for (const bet of pending) {
      const match = finishedById.get(bet.matchId);
      if (!match?.result) continue;
      const points = getPointsForBet(bet, match);
      await fs.patch("bets", bet.id, {
        status: points > 0 ? "WON" : "LOST",
        points,
      });
      if (points > 0) await awardCoins(bet.userId, points);
      resolved++;
    }
    if (resolved > 0) await recordGroupLeaderWins();
    return { resolved };
  }

  const BATCH_SIZE = 400;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = adminDb.batch();
    for (const bet of pending.slice(i, i + BATCH_SIZE)) {
      const match = finishedById.get(bet.matchId);
      if (!match?.result) continue;
      const points = getPointsForBet(bet, match);
      batch.update(adminDb.collection("bets").doc(bet.id), {
        status: points > 0 ? "WON" : "LOST",
        points,
      });
      if (points > 0) await awardCoins(bet.userId, points);
      resolved++;
    }
    await batch.commit();
  }

  if (resolved > 0) await recordGroupLeaderWins();

  return { resolved };
}
