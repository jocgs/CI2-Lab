/**
 * GET /api/sync-matches
 *
 * Descarga partidos de football-data.org y los guarda en Firestore.
 * Protegido con CRON_SECRET para que solo Vercel (o tú) pueda llamarlo.
 *
 * Vercel lo invoca automáticamente según el cron definido en vercel.json.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRecentAndUpcomingMatches } from "@/lib/football-api";

export async function GET(req: NextRequest) {
  // ── Protección: solo Vercel Cron o llamadas con el secreto correcto ─────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const isVercelCron   = authHeader === `Bearer ${cronSecret}`;
    const isManualCall   = req.nextUrl.searchParams.get("secret") === cronSecret;
    if (!isVercelCron && !isManualCall) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const { competitions, teams, matches } = await fetchRecentAndUpcomingMatches();

    const { adminDb }          = await import("@/lib/firebase-admin");
    const { resolveFinishedBets } = await import("@/lib/db");

    // Borramos y reescribimos matches, teams y competitions para mantenerlos limpios
    async function clearCollection(collection: string) {
      const snap = await adminDb.collection(collection).get();
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = adminDb.batch();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap.docs.slice(i, i + 400).forEach((d: any) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    async function batchUpsert<T extends { id: string }>(collection: string, items: T[]) {
      for (let i = 0; i < items.length; i += 400) {
        const batch = adminDb.batch();
        for (const { id, ...data } of items.slice(i, i + 400)) {
          batch.set(adminDb.collection(collection).doc(id), data);
        }
        await batch.commit();
      }
    }

    await clearCollection("matches");
    await clearCollection("teams");
    await clearCollection("competitions");

    await batchUpsert("competitions", competitions);
    await batchUpsert("teams", teams);
    await batchUpsert("matches", matches);

    const { resolved } = await resolveFinishedBets(matches);

    console.log(`[sync-matches] ✓ ${matches.length} partidos, ${resolved} porras resueltas`);

    return NextResponse.json({
      ok: true,
      synced: {
        competitions: competitions.length,
        teams: teams.length,
        matches: matches.length,
        betsResolved: resolved,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[sync-matches] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
