import { getMatches } from "@/lib/db";
import { adminDb } from "@/lib/firebase-admin";
import { getApps } from "firebase-admin/app";

export const WORLD_CUP_COMPETITION_ID = "fd_comp_WC";
export const MIN_MANUAL_SYNC_INTERVAL_MS = 2 * 60 * 1000;

export interface MatchSyncMeta {
  lastSyncedAt: string;
  lastManualSyncedAt?: string;
  matchCount: number;
  finishedCount: number;
}

export function isMatchSyncEnabled(): boolean {
  return (
    process.env.USE_MOCK_DATA !== "true" && Boolean(process.env.FOOTBALL_DATA_API_KEY?.trim())
  );
}

export function isCronRequest(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

async function readSyncMeta(): Promise<MatchSyncMeta | null> {
  if (getApps().length === 0) return null;
  const snap = await adminDb.collection("meta").doc("matchSync").get();
  if (!snap.exists) return null;
  return snap.data() as MatchSyncMeta;
}

export async function writeSyncMeta(meta: MatchSyncMeta): Promise<void> {
  if (getApps().length === 0) return;
  await adminDb.collection("meta").doc("matchSync").set(meta, { merge: true });
}

export async function assertManualSyncAllowed(req: Request): Promise<string | null> {
  if (isCronRequest(req)) return null;
  if (isCronRequest(req)) return null;
  const meta = await readSyncMeta();
  const lastManual = meta?.lastManualSyncedAt ?? meta?.lastSyncedAt;
  if (!lastManual) return null;
  const elapsed = Date.now() - new Date(lastManual).getTime();
  if (elapsed < MIN_MANUAL_SYNC_INTERVAL_MS) {
    const waitSec = Math.ceil((MIN_MANUAL_SYNC_INTERVAL_MS - elapsed) / 1000);
    return `Espera ${waitSec}s antes de volver a sincronizar.`;
  }
  return null;
}

export async function getMatchSyncStatus(): Promise<{
  enabled: boolean;
  syncedAt: string | null;
  matchCount: number;
  finishedCount: number;
}> {
  if (!isMatchSyncEnabled()) {
    return { enabled: false, syncedAt: null, matchCount: 0, finishedCount: 0 };
  }

  const [meta, matches] = await Promise.all([readSyncMeta(), getMatches()]);
  const wcMatches = matches.filter((m) => m.competitionId === WORLD_CUP_COMPETITION_ID);

  return {
    enabled: true,
    syncedAt: meta?.lastSyncedAt ?? null,
    matchCount: wcMatches.length,
    finishedCount: wcMatches.filter((m) => m.status === "FINISHED").length,
  };
}
