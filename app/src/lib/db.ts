/**
 * Capa de acceso a datos — Firestore (Firebase Admin SDK) o mocks.
 *
 * Cuando USE_MOCKS=true cada función delega a lib/mocks/index.ts.
 * El resto de la app no necesita saber cuál se usa.
 */

import { adminDb } from "./firebase-admin";
import { buildRanking, computeStreak, getPointsForBet } from "./scoring";
import { getSessionUser, getSessionUserId } from "./session";
import { USE_MOCKS } from "./runtime";
import { fetchRecentAndUpcomingMatches } from "./football-api";
import * as MockDb from "./mocks";
import { MOCK_RANK_CHANGES } from "./mocks/users";
import {
  getLiveCompetitions,
  getLiveTeams,
  getLiveMatches,
} from "./mocks/live-store";
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

const MOCKS = USE_MOCKS;
type RemoteMatchData = Awaited<ReturnType<typeof fetchRecentAndUpcomingMatches>>;

let remoteMatchDataPromise: Promise<RemoteMatchData> | null = null;

// ---------------------------------------------------------------------------
// Helpers — live-store con fallback a mocks estáticos
// ---------------------------------------------------------------------------

const byKickoff = (a: Match, b: Match) =>
  new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();

function mockTeams(): Team[] {
  return getLiveTeams() ?? MockDb.getTeams();
}
function mockCompetitions(): Competition[] {
  return getLiveCompetitions() ?? MockDb.getCompetitions();
}
function mockMatches(): Match[] {
  const live = getLiveMatches();
  if (live) return [...live].sort(byKickoff);
  return MockDb.getMatches();
}

async function getRemoteMatchData(): Promise<RemoteMatchData> {
  if (!remoteMatchDataPromise) {
    remoteMatchDataPromise = fetchRecentAndUpcomingMatches();
  }
  return remoteMatchDataPromise;
}

async function resolveMatchData(): Promise<RemoteMatchData> {
  const liveMatches = getLiveMatches();
  if (liveMatches) {
    return {
      competitions: getLiveCompetitions() ?? [],
      teams: getLiveTeams() ?? [],
      matches: [...liveMatches].sort(byKickoff),
    };
  }

  if (process.env.FOOTBALL_DATA_API_KEY) {
    return getRemoteMatchData();
  }

  return {
    competitions: MockDb.getCompetitions(),
    teams: MockDb.getTeams(),
    matches: MockDb.getMatches(),
  };
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<User> {
  if (MOCKS) return MockDb.getCurrentUser();
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  if (MOCKS) return MockDb.CURRENT_USER_ID;
  return getSessionUserId();
}

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
  if (MOCKS) return MockDb.getUsers();
  const snap = await adminDb.collection("users").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (MOCKS) return MockDb.getUserById(id);
  const doc = await adminDb.collection("users").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as User;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  if (MOCKS) return MockDb.getUserByUsername(username);
  const normalizedUsername = username.trim().toLowerCase();
  const snap = await adminDb
    .collection("users")
    .where("username", "==", normalizedUsername)
    .limit(1)
    .get();
  if (snap.empty) return undefined;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function getFriendsForUser(userId: string): Promise<User[]> {
  if (MOCKS) return MockDb.getFriendsForUser(userId);
  const user = await getUserById(userId);
  if (!user) return [];
  const friendIds = user.friendIds ?? [];
  const friends = await Promise.all(friendIds.map((friendId) => getUserById(friendId)));
  return friends.filter((friend): friend is User => Boolean(friend));
}

export async function getFriendRequestsReceived(userId: string): Promise<User[]> {
  if (MOCKS) return MockDb.getFriendRequestsReceived(userId);
  const user = await getUserById(userId);
  if (!user) return [];
  const requestIds = user.friendRequestReceivedIds ?? [];
  const requests = await Promise.all(requestIds.map((requestId) => getUserById(requestId)));
  return requests.filter((request): request is User => Boolean(request));
}

export async function getFriendRequestsSent(userId: string): Promise<User[]> {
  if (MOCKS) return MockDb.getFriendRequestsSent(userId);
  const user = await getUserById(userId);
  if (!user) return [];
  const requestIds = user.friendRequestSentIds ?? [];
  const requests = await Promise.all(requestIds.map((requestId) => getUserById(requestId)));
  return requests.filter((request): request is User => Boolean(request));
}

export async function updateUserProfile(
  userId: string,
  input: {
    avatarUrl?: string | null;
    supportedNationalTeamId?: string | null;
    supportedTeamIds?: string[];
  }
): Promise<User> {
  if (MOCKS) return MockDb.updateUserProfile(userId, input);

  const updatePayload = {
    avatarUrl: input.avatarUrl?.trim() || null,
    supportedNationalTeamId: input.supportedNationalTeamId?.trim() || null,
    supportedTeamIds: (input.supportedTeamIds ?? []).filter(Boolean),
  };

  await adminDb.collection("users").doc(userId).update(updatePayload);
  const updated = await getUserById(userId);
  if (!updated) throw new Error("Usuario no encontrado");
  return updated;
}

export async function requestFriendByUsername(
  userId: string,
  username: string
): Promise<User> {
  if (MOCKS) return MockDb.requestFriendByUsername(userId, username);

  const user = await getUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const friend = await getUserByUsername(username.toLowerCase());
  if (!friend) throw new Error("No existe ningún usuario con ese nombre");
  if (friend.id === user.id) throw new Error("No puedes añadirte a ti mismo");

  if ((user.friendIds ?? []).includes(friend.id)) {
    return friend;
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

  await Promise.all([
    adminDb.collection("users").doc(user.id).update({ friendRequestSentIds: [...userSent] }),
    adminDb.collection("users").doc(friend.id).update({ friendRequestReceivedIds: [...friendReceived] }),
  ]);

  return friend;
}

export async function acceptFriendRequestByUsername(
  userId: string,
  username: string
): Promise<User> {
  if (MOCKS) return MockDb.acceptFriendRequestByUsername(userId, username);

  const user = await getUserById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const requester = await getUserByUsername(username.toLowerCase());
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

  await Promise.all([
    adminDb.collection("users").doc(user.id).update({
      friendIds: [...userFriends],
      friendRequestReceivedIds: [...received],
      friendRequestSentIds: [...userSent],
    }),
    adminDb.collection("users").doc(requester.id).update({
      friendIds: [...requesterFriends],
      friendRequestReceivedIds: [...requesterReceived],
      friendRequestSentIds: [...requesterSent],
    }),
  ]);

  return requester;
}

export async function addFriendByUsername(userId: string, username: string): Promise<User> {
  return requestFriendByUsername(userId, username);
}

// ---------------------------------------------------------------------------
// Equipos y competiciones
// ---------------------------------------------------------------------------

export async function getTeams(): Promise<Team[]> {
  if (MOCKS) return (await resolveMatchData()).teams;
  const snap = await adminDb.collection("teams").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Team);
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  if (MOCKS) return (await resolveMatchData()).teams.find((t) => t.id === id);
  if (!id) return undefined;
  const doc = await adminDb.collection("teams").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Team;
}

export async function getCompetitions(): Promise<Competition[]> {
  if (MOCKS) return (await resolveMatchData()).competitions;
  const snap = await adminDb.collection("competitions").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Competition);
}

export async function getCompetitionById(
  id: string
): Promise<Competition | undefined> {
  if (MOCKS) return (await resolveMatchData()).competitions.find((c) => c.id === id);
  if (!id) return undefined;
  const doc = await adminDb.collection("competitions").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Competition;
}

// ---------------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  if (MOCKS) return (await resolveMatchData()).matches;
  const snap = await adminDb.collection("matches").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Match).sort(byKickoff);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  if (MOCKS) return (await resolveMatchData()).matches.find((m) => m.id === id);
  const doc = await adminDb.collection("matches").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Match;
}

export async function getUpcomingMatches(): Promise<Match[]> {
  if (MOCKS) {
    return (await resolveMatchData()).matches.filter(
      (m) => m.status === "SCHEDULED" || m.status === "LIVE"
    );
  }
  const snap = await adminDb
    .collection("matches")
    .where("status", "in", ["SCHEDULED", "LIVE"])
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Match)
    .sort(byKickoff);
}

export async function getFinishedMatches(): Promise<Match[]> {
  if (MOCKS) {
    return (await resolveMatchData()).matches.filter((m) => m.status === "FINISHED");
  }
  const snap = await adminDb
    .collection("matches")
    .where("status", "==", "FINISHED")
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Match)
    .sort(byKickoff);
}

// ---------------------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------------------

export async function getGroupById(id: string): Promise<Group | undefined> {
  if (MOCKS) return MockDb.getGroupById(id);
  const doc = await adminDb.collection("groups").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Group;
}

export async function getGroupsForUser(userId: string): Promise<Group[]> {
  if (MOCKS) return MockDb.getGroupsForUser(userId);
  const snap = await adminDb
    .collection("groups")
    .where("memberIds", "array-contains", userId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Group);
}

// ---------------------------------------------------------------------------
// Porras
// ---------------------------------------------------------------------------

export async function getBetsForUser(userId: string): Promise<Bet[]> {
  if (MOCKS) return MockDb.getBetsForUser(userId);
  const snap = await adminDb
    .collection("bets")
    .where("userId", "==", userId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Bet);
}

export async function getBetsForMatch(matchId: string): Promise<Bet[]> {
  if (MOCKS) return MockDb.getBetsForMatch(matchId);
  const snap = await adminDb
    .collection("bets")
    .where("matchId", "==", matchId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Bet);
}

export async function getBetForUserAndMatch(
  userId: string,
  matchId: string
): Promise<Bet | undefined> {
  if (MOCKS) return MockDb.getBetForUserAndMatch(userId, matchId);
  const snap = await adminDb
    .collection("bets")
    .where("userId", "==", userId)
    .where("matchId", "==", matchId)
    .limit(1)
    .get();
  if (snap.empty) return undefined;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Bet;
}

export async function upsertBet(input: {
  userId: string;
  matchId: string;
  prediction: { outcome: Outcome; homeGoals: number; awayGoals: number };
}): Promise<Bet> {
  if (MOCKS) return MockDb.upsertBet(input);

  const existing = await getBetForUserAndMatch(input.userId, input.matchId);

  if (existing) {
    await adminDb.collection("bets").doc(existing.id).update({
      prediction: input.prediction,
      createdAt: new Date().toISOString(),
    });
    return { ...existing, prediction: input.prediction };
  }

  const newBet: Omit<Bet, "id"> = {
    userId: input.userId,
    matchId: input.matchId,
    prediction: input.prediction,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    points: 0,
  };

  const ref = await adminDb.collection("bets").add(newBet);
  return { id: ref.id, ...newBet };
}

// ---------------------------------------------------------------------------
// Vistas derivadas
// ---------------------------------------------------------------------------

export async function getGlobalRanking(): Promise<RankingEntry[]> {
  if (MOCKS) return MockDb.getGlobalRanking(MOCK_RANK_CHANGES);
  const [users, bets, matches] = await Promise.all([
    getUsers(),
    getBetsAll(),
    getMatches(),
  ]);
  return buildRanking(users, bets, matches);
}

export async function getGroupRanking(groupId: string): Promise<RankingEntry[]> {
  if (MOCKS) return MockDb.getGroupRanking(groupId, MOCK_RANK_CHANGES);
  const group = await getGroupById(groupId);
  if (!group) return [];

  const [allUsers, bets, matches] = await Promise.all([
    getUsers(),
    getBetsAll(),
    getMatches(),
  ]);

  const members = allUsers.filter((u) => group.memberIds.includes(u.id));
  return buildRanking(members, bets, matches);
}

export async function getStreakForUser(userId: string): Promise<UserStreak> {
  if (MOCKS) return MockDb.getStreakForUser(userId);
  const [bets, matches] = await Promise.all([
    getBetsForUser(userId),
    getMatches(),
  ]);
  return computeStreak(userId, bets, matches);
}

// ---------------------------------------------------------------------------
// Grupos — escritura
// ---------------------------------------------------------------------------

export async function createGroup(input: {
  name: string;
  ownerId: string;
}): Promise<Group> {
  if (MOCKS) {
    const { MOCK_GROUPS } = await import("./mocks/groups");
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const group: Group = {
      id: `group_${Math.random().toString(36).slice(2, 8)}`,
      name: input.name,
      inviteCode,
      ownerId: input.ownerId,
      memberIds: [input.ownerId],
      createdAt: new Date().toISOString(),
    };
    MOCK_GROUPS.push(group);
    return group;
  }

  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const group: Omit<Group, "id"> = {
    name: input.name,
    inviteCode,
    ownerId: input.ownerId,
    memberIds: [input.ownerId],
    createdAt: new Date().toISOString(),
  };
  const ref = await adminDb.collection("groups").add(group);
  return { id: ref.id, ...group };
}

export async function joinGroup(
  code: string,
  userId: string
): Promise<Group | null> {
  if (MOCKS) {
    const { MOCK_GROUPS } = await import("./mocks/groups");
    const group = MOCK_GROUPS.find(
      (g) => g.inviteCode === code.toUpperCase()
    );
    if (!group) return null;
    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
    }
    return group;
  }

  const snap = await adminDb
    .collection("groups")
    .where("inviteCode", "==", code.toUpperCase())
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const group = { id: doc.id, ...doc.data() } as Group;

  if (!group.memberIds.includes(userId)) {
    await doc.ref.update({
      memberIds: [...group.memberIds, userId],
    });
    group.memberIds.push(userId);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Resolución de porras
// ---------------------------------------------------------------------------

/**
 * Revisa todas las porras PENDING y las resuelve (WON/LOST) si su partido
 * ya está FINISHED. Devuelve el número de porras actualizadas.
 */
export async function resolveFinishedBets(
  matches: Match[]
): Promise<{ resolved: number }> {
  const finishedById = new Map(
    matches
      .filter((m) => m.status === "FINISHED" && m.result)
      .map((m) => [m.id, m])
  );

  if (finishedById.size === 0) return { resolved: 0 };

  const snap = await adminDb
    .collection("bets")
    .where("status", "==", "PENDING")
    .get();

  if (snap.empty) return { resolved: 0 };

  let resolved = 0;

  // Firestore batch tiene límite de 500 ops
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = adminDb.batch();
    for (const doc of snap.docs.slice(i, i + 400)) {
      const bet = { id: doc.id, ...doc.data() } as Bet;
      const match = finishedById.get(bet.matchId);
      if (!match?.result) continue;

      const points = getPointsForBet(bet, match);
      batch.update(doc.ref, {
        status: points > 0 ? "WON" : "LOST",
        points,
      });
      resolved++;
    }
    await batch.commit();
  }

  return { resolved };
}

// ---------------------------------------------------------------------------
// Interno
// ---------------------------------------------------------------------------

async function getBetsAll(): Promise<Bet[]> {
  const snap = await adminDb.collection("bets").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Bet);
}
