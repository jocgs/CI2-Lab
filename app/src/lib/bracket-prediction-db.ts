import type { GroupStandings, KnockoutWinners, UserWorldCupBracketPrediction } from "@/types/bracket-prediction";
import * as store from "./data-store";

const COLLECTION = "world_cup_bracket_predictions";

interface StoredBracketPrediction extends UserWorldCupBracketPrediction {
  id: string;
}

function predictionId(userId: string, tournamentId: string): string {
  return `${userId}_${tournamentId}`;
}

function toPublic(p: StoredBracketPrediction): UserWorldCupBracketPrediction {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...rest } = p;
  return {
    ...rest,
    qualifyingThirdGroups: rest.qualifyingThirdGroups ?? [],
  };
}

export async function getUserWorldCupBracketPrediction(
  userId: string,
  tournamentId: string,
): Promise<UserWorldCupBracketPrediction | null> {
  const doc = await store.getById<StoredBracketPrediction>(
    COLLECTION,
    predictionId(userId, tournamentId),
  );
  return doc ? toPublic(doc) : null;
}

export async function saveUserWorldCupBracketPrediction(data: {
  userId: string;
  tournamentId: string;
  groupStandings: GroupStandings;
  qualifyingThirdGroups: string[];
  knockoutWinners: KnockoutWinners;
}): Promise<UserWorldCupBracketPrediction> {
  const now = new Date().toISOString();
  const id = predictionId(data.userId, data.tournamentId);
  const existing = await store.getById<StoredBracketPrediction>(COLLECTION, id);

  if (existing) {
    await store.patch(COLLECTION, id, {
      groupStandings: data.groupStandings,
      qualifyingThirdGroups: data.qualifyingThirdGroups,
      knockoutWinners: data.knockoutWinners,
      updatedAt: now,
    });
    return toPublic({
      ...existing,
      groupStandings: data.groupStandings,
      qualifyingThirdGroups: data.qualifyingThirdGroups,
      knockoutWinners: data.knockoutWinners,
      updatedAt: now,
    });
  }

  const created: StoredBracketPrediction = {
    id,
    userId: data.userId,
    tournamentId: data.tournamentId,
    groupStandings: data.groupStandings,
    qualifyingThirdGroups: data.qualifyingThirdGroups,
    knockoutWinners: data.knockoutWinners,
    createdAt: now,
    updatedAt: now,
  };
  await store.insert(COLLECTION, created);
  return toPublic(created);
}
