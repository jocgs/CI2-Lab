import type { UserTournamentPicks } from "@/types/picks";

// ─── In-memory store anchored to global (survives HMR in dev) ────────────────

declare global {
  // eslint-disable-next-line no-var
  var __tournamentPicks: UserTournamentPicks[] | undefined;
}

const PICKS_STORE: UserTournamentPicks[] = (global.__tournamentPicks ??= []);

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getUserTournamentPicks(
  userId: string,
  tournamentId: string,
): Promise<UserTournamentPicks | null> {
  return (
    PICKS_STORE.find((p) => p.userId === userId && p.tournamentId === tournamentId) ?? null
  );
}

export async function saveUserTournamentPicks(data: {
  userId: string;
  tournamentId: string;
  revelationTeamId: string;
}): Promise<UserTournamentPicks> {
  const now = new Date().toISOString();
  const existing = PICKS_STORE.find(
    (p) => p.userId === data.userId && p.tournamentId === data.tournamentId,
  );

  if (existing) {
    existing.revelationTeamId = data.revelationTeamId;
    existing.updatedAt = now;
    return existing;
  }

  const newPick: UserTournamentPicks = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  PICKS_STORE.push(newPick);
  return newPick;
}

export async function getAllPicksByTournament(
  tournamentId: string,
): Promise<UserTournamentPicks[]> {
  return PICKS_STORE.filter((p) => p.tournamentId === tournamentId);
}
