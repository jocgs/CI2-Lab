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
  // ── Modo mock: omitir la API externa y responder sin tocar Firestore ─────────
  const useMock =
    process.env.USE_MOCK_DATA === "true" ||
    !process.env.FOOTBALL_DATA_API_KEY;

  if (useMock) {
    return NextResponse.json({
      ok: true,
      mock: true,
      message:
        "USE_MOCK_DATA=true o FOOTBALL_DATA_API_KEY no configurada — usando datos mock locales.",
    });
  }

  // ── Protección: solo Vercel Cron o llamadas con el secreto correcto ─────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualCall = req.nextUrl.searchParams.get("secret") === cronSecret;

    if (!isVercelCron && !isManualCall) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const { competitions, teams, matches } =
      await fetchRecentAndUpcomingMatches();

    const { adminDb } = await import("@/lib/firebase-admin");
    const { resolveFinishedBets } = await import("@/lib/db");

    async function batchUpsert<T extends { id: string }>(
      collection: string,
      items: T[],
    ) {
      for (let i = 0; i < items.length; i += 400) {
        const batch = adminDb.batch();

        for (const { id, ...data } of items.slice(i, i + 400)) {
          batch.set(adminDb.collection(collection).doc(id), data);
        }

        await batch.commit();
      }
    }

    if (
      competitions.length === 0 ||
      teams.length === 0 ||
      matches.length === 0
    ) {
      console.warn(
        "[sync-matches] API devolvió datos vacíos — sync abortado para evitar borrado accidental.",
      );

      return NextResponse.json(
        {
          error: "La API externa devolvió datos vacíos. Sync abortado.",
          received: {
            competitions: competitions.length,
            teams: teams.length,
            matches: matches.length,
          },
        },
        { status: 422 },
      );
    }

    // Borra solo los partidos que vienen de la API (prefijo fd_match_) para
    // evitar datos obsoletos, pero preserva los partidos creados manualmente.
    async function clearApiMatches() {
      const snap = await adminDb
        .collection("matches")
        .where("__name__", ">=", "fd_match_")
        .where("__name__", "<", "fd_match_~")
        .get();

      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = adminDb.batch();

        snap.docs.slice(i, i + 400).forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      }
    }

    // Teams y competitions: upsert sin borrar — preserva datos manuales.
    await batchUpsert("competitions", competitions);
    await batchUpsert("teams", teams);

    // Matches: limpia solo los de la API, luego reescribe.
    await clearApiMatches();
    await batchUpsert("matches", matches);

    const { resolved } = await resolveFinishedBets(matches);

    console.log(
      `[sync-matches] ✓ ${matches.length} partidos, ${resolved} porras resueltas`,
    );

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