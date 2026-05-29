import * as fs from "./data-store";
import type { UserTournamentPicks } from "@/types/picks";

interface StoredPick extends UserTournamentPicks {
  id: string;
}

function pickId(userId: string, tournamentId: string) {
  return `${userId}_${tournamentId}`;
}

function toPublic(p: StoredPick): UserTournamentPicks {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...rest } = p;
  return rest as UserTournamentPicks;
}

export async function getUserTournamentPicks(
  userId: string,
  tournamentId: string,
): Promise<UserTournamentPicks | null> {
  const pick = await fs.getById<StoredPick>("tournament_picks", pickId(userId, tournamentId));
  return pick ? toPublic(pick) : null;
}

export async function saveUserTournamentPicks(data: {
  userId: string;
  tournamentId: string;
  revelationTeamId: string;
}): Promise<UserTournamentPicks> {
  const now = new Date().toISOString();
  const id = pickId(data.userId, data.tournamentId);
  const existing = await fs.getById<StoredPick>("tournament_picks", id);

  if (existing) {
    await fs.patch("tournament_picks", id, {
      revelationTeamId: data.revelationTeamId,
      updatedAt: now,
    });
    return toPublic({ ...existing, revelationTeamId: data.revelationTeamId, updatedAt: now });
  }

  const newPick: StoredPick = {
    id,
    userId: data.userId,
    tournamentId: data.tournamentId,
    revelationTeamId: data.revelationTeamId,
    disappointmentTeamId: null,
    createdAt: now,
    updatedAt: now,
  };
  await fs.insert("tournament_picks", newPick);
  return toPublic(newPick);
}

export async function getAllPicksByTournament(
  tournamentId: string,
): Promise<UserTournamentPicks[]> {
  const picks = await fs.queryWhere<StoredPick>("tournament_picks", "tournamentId", tournamentId);
  return picks.map(toPublic);
}
