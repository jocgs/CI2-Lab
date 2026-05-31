/**
 * GET /api/sync-matches
 *
 * Sincroniza Mundial 2026 (+ Champions si SYNC_CHAMPIONS=true).
 * Upsert en Firestore — no borra partidos ya guardados.
 */

import { NextRequest, NextResponse } from "next/server";
import { isStaleScheduledMatch } from "@/lib/match-display";
import { fetchSyncMatches } from "@/lib/football-api";
import {
  assertManualSyncAllowed,
  isCronRequest,
  isMatchSyncEnabled,
  writeSyncMeta,
  WORLD_CUP_COMPETITION_ID,
} from "@/lib/match-sync";

export async function GET(req: NextRequest) {
  if (!isMatchSyncEnabled()) {
    return NextResponse.json({
      ok: false,
      mock: true,
      error:
        "Sincronización desactivada (USE_MOCK_DATA=true o falta FOOTBALL_DATA_API_KEY).",
    });
  }

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const isVercelCron = isCronRequest(req);
    const isManualCall = req.nextUrl.searchParams.get("secret") === cronSecret;
    if (!isVercelCron && !isManualCall) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const throttleMessage = await assertManualSyncAllowed(req);
  if (throttleMessage) {
    return NextResponse.json({ ok: false, error: throttleMessage }, { status: 429 });
  }

  try {
    const { competitions, teams, matches } = await fetchSyncMatches();

    if (matches.length === 0) {
      console.warn("[sync-matches] API devolvió 0 partidos del Mundial — sync abortado.");
      return NextResponse.json(
        {
          ok: false,
          error: "La API no devolvió partidos del Mundial. Sync abortado.",
        },
        { status: 422 },
      );
    }

    const { adminDb } = await import("@/lib/firebase-admin");
    const { getMatches, resolveFinishedBets } = await import("@/lib/db");

    async function batchUpsert<T extends { id: string }>(collection: string, items: T[]) {
      for (let i = 0; i < items.length; i += 400) {
        const batch = adminDb.batch();
        for (const { id, ...data } of items.slice(i, i + 400)) {
          batch.set(adminDb.collection(collection).doc(id), data, { merge: true });
        }
        await batch.commit();
      }
    }

    await batchUpsert("competitions", competitions);
    await batchUpsert("teams", teams);
    await batchUpsert("matches", matches);

    // Solo elimina SCHEDULED obsoletos fuera del Mundial (nunca FINISHED).
    const staleSnap = await adminDb.collection("matches").get();
    let pruned = 0;
    for (let i = 0; i < staleSnap.docs.length; i += 400) {
      const batch = adminDb.batch();
      for (const doc of staleSnap.docs.slice(i, i + 400)) {
        const data = doc.data();
        if (
          doc.id.startsWith("fd_match_") &&
          data.competitionId !== WORLD_CUP_COMPETITION_ID &&
          data.status === "SCHEDULED" &&
          isStaleScheduledMatch({ ...data, id: doc.id } as import("@/types/domain").Match)
        ) {
          batch.delete(doc.ref);
          pruned++;
        }
      }
      await batch.commit();
    }

    const allMatches = await getMatches();
    const { resolved } = await resolveFinishedBets(allMatches);

    const wcMatches = allMatches.filter((m) => m.competitionId === WORLD_CUP_COMPETITION_ID);
    const finishedCount = wcMatches.filter((m) => m.status === "FINISHED").length;
    const now = new Date().toISOString();
    const fromCron = isCronRequest(req);

    await writeSyncMeta({
      lastSyncedAt: now,
      ...(!fromCron ? { lastManualSyncedAt: now } : {}),
      matchCount: wcMatches.length,
      finishedCount,
    });

    console.log(
      `[sync-matches] ✓ ${matches.length} partidos WC upsert · ${pruned} obsoletos eliminados · ${finishedCount} finalizados · ${resolved} porras resueltas`,
    );

    return NextResponse.json({
      ok: true,
      synced: {
        competitions: competitions.length,
        teams: teams.length,
        matches: matches.length,
        worldCupMatches: wcMatches.length,
        worldCupFinished: finishedCount,
        championsIncluded: process.env.SYNC_CHAMPIONS === "true",
        betsResolved: resolved,
        prunedStale: pruned,
      },
      syncedAt: now,
    });
  } catch (err) {
    console.error("[sync-matches] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
