import type { UserTournamentPicks } from "@/types/picks";
import * as store from "./data-store";

const COLLECTION = "tournament_picks";

interface StoredPick extends UserTournamentPicks {
  id: string;
}

function pickId(userId: string, tournamentId: string): string {
  return `${userId}_${tournamentId}`;
}

function toPublic(p: StoredPick): UserTournamentPicks {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...rest } = p;
  return rest as UserTournamentPicks;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getUserTournamentPicks(
  userId: string,
  tournamentId: string,
): Promise<UserTournamentPicks | null> {
  const pick = await store.getById<StoredPick>(COLLECTION, pickId(userId, tournamentId));
  return pick ? toPublic(pick) : null;
}

export type BolaDeCristalPicksPayload = Pick<
  UserTournamentPicks,
  | "revelationTeamId"
  | "ballonDOrPlayerId"
  | "goldenBootPlayerId"
  | "goldenGlovePlayerId"
  | "bestYoungPlayerId"
  | "topAssistPlayerId"
  | "bestGoalTeamId"
  | "bestGroupStageTeamId"
  | "worstGroupStageTeamId"
  | "bestNonUefaConmebolTeamId"
>;

/** Guarda o actualiza todos los premios globales de Bola de cristal. */
export async function saveBolaDeCristalPicks(data: {
  userId: string;
  tournamentId: string;
  picks: BolaDeCristalPicksPayload;
}): Promise<UserTournamentPicks> {
  const now = new Date().toISOString();
  const id = pickId(data.userId, data.tournamentId);
  const existing = await store.getById<StoredPick>(COLLECTION, id);

  if (existing) {
    await store.patch(COLLECTION, id, {
      ...data.picks,
      updatedAt: now,
    });
    return toPublic({ ...existing, ...data.picks, updatedAt: now });
  }

  const newPick: StoredPick = {
    id,
    userId: data.userId,
    tournamentId: data.tournamentId,
    disappointmentTeamId: null,
    createdAt: now,
    updatedAt: now,
    ...data.picks,
  };
  await store.insert(COLLECTION, newPick);
  return toPublic(newPick);
}

/** Solo actualiza la revelación (p. ej. formulario legacy en /picks). */
export async function saveUserTournamentPicks(data: {
  userId: string;
  tournamentId: string;
  revelationTeamId: string;
}): Promise<UserTournamentPicks> {
  const now = new Date().toISOString();
  const id = pickId(data.userId, data.tournamentId);
  const existing = await store.getById<StoredPick>(COLLECTION, id);

  if (existing) {
    await store.patch(COLLECTION, id, {
      revelationTeamId: data.revelationTeamId,
      updatedAt: now,
    });
    return toPublic({ ...existing, revelationTeamId: data.revelationTeamId, updatedAt: now });
  }

  return saveBolaDeCristalPicks({
    userId: data.userId,
    tournamentId: data.tournamentId,
    picks: {
      revelationTeamId: data.revelationTeamId,
      ballonDOrPlayerId: null,
      goldenBootPlayerId: null,
      goldenGlovePlayerId: null,
      bestYoungPlayerId: null,
      topAssistPlayerId: null,
      bestGoalTeamId: null,
      bestGroupStageTeamId: null,
      worstGroupStageTeamId: null,
      bestNonUefaConmebolTeamId: null,
    },
  });
}

export async function getAllPicksByTournament(
  tournamentId: string,
): Promise<UserTournamentPicks[]> {
  const picks = await store.queryWhere<StoredPick>(COLLECTION, "tournamentId", tournamentId);
  return picks.map(toPublic);
}
