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

// ---------------------------------------------------------------------------
// Equipos y competiciones
// ---------------------------------------------------------------------------

export async function getTeams(): Promise<Team[]> {
  if (MOCKS) return mockTeams();
  const snap = await adminDb.collection("teams").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Team);
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  if (MOCKS) return mockTeams().find((t) => t.id === id);
  if (!id) return undefined;
  const doc = await adminDb.collection("teams").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Team;
}

export async function getCompetitions(): Promise<Competition[]> {
  if (MOCKS) return mockCompetitions();
  const snap = await adminDb.collection("competitions").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Competition);
}

export async function getCompetitionById(
  id: string
): Promise<Competition | undefined> {
  if (MOCKS) return mockCompetitions().find((c) => c.id === id);
  if (!id) return undefined;
  const doc = await adminDb.collection("competitions").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Competition;
}

// ---------------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------------

export async function getMatches(): Promise<Match[]> {
  if (MOCKS) return mockMatches();
  const snap = await adminDb.collection("matches").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Match).sort(byKickoff);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  if (MOCKS) return mockMatches().find((m) => m.id === id);
  const doc = await adminDb.collection("matches").doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as Match;
}

export async function getUpcomingMatches(): Promise<Match[]> {
  if (MOCKS) return mockMatches().filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
  const snap = await adminDb
    .collection("matches")
    .where("status", "in", ["SCHEDULED", "LIVE"])
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Match)
    .sort(byKickoff);
}

export async function getFinishedMatches(): Promise<Match[]> {
  if (MOCKS) return mockMatches().filter((m) => m.status === "FINISHED");
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
