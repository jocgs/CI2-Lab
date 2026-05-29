import type { UserTournamentPicks } from "@/types/picks";
import * as store from "./data-store";

const COLLECTION = "tournament_picks";

function docId(userId: string, tournamentId: string): string {
  return `${userId}_${tournamentId}`;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getUserTournamentPicks(
  userId: string,
  tournamentId: string,
): Promise<UserTournamentPicks | null> {
  const result = await store.queryWhereCompoundOne<UserTournamentPicks>(COLLECTION, [
    ["userId", userId],
    ["tournamentId", tournamentId],
  ]);
  return result ?? null;
}

export async function saveUserTournamentPicks(data: {
  userId: string;
  tournamentId: string;
  revelationTeamId: string;
}): Promise<UserTournamentPicks> {
  const now = new Date().toISOString();
  const existing = await getUserTournamentPicks(data.userId, data.tournamentId);

  const pick: UserTournamentPicks = {
    userId: data.userId,
    tournamentId: data.tournamentId,
    revelationTeamId: data.revelationTeamId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await store.upsert(COLLECTION, { id: docId(data.userId, data.tournamentId), ...pick });
  return pick;
}

export async function getAllPicksByTournament(
  tournamentId: string,
): Promise<UserTournamentPicks[]> {
  return store.queryWhere<UserTournamentPicks>(COLLECTION, "tournamentId", tournamentId);
}
