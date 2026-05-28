/**
 * GET /api/sync-matches
 *
 * Obtiene partidos reales de football-data.org y los almacena:
 *  - USE_MOCKS=true  → en el live-store en memoria (sin Firebase)
 *  - USE_MOCKS=false → en Firestore (Firebase Admin SDK)
 */

import { NextResponse } from "next/server";
import { fetchRecentAndUpcomingMatches } from "@/lib/football-api";
import { USE_MOCKS } from "@/lib/runtime";

export async function GET() {
  try {
    const { competitions, teams, matches } = await fetchRecentAndUpcomingMatches();

    if (USE_MOCKS) {
      // ── Modo mock: guardar en memoria, sin Firebase ──────────────────────
      const { setLiveData } = await import("@/lib/mocks/live-store");
      setLiveData({ competitions, teams, matches });

      return NextResponse.json({
        ok: true,
        mode: "mock",
        synced: {
          competitions: competitions.length,
          teams: teams.length,
          matches: matches.length,
        },
      });
    }

    // ── Modo Firebase: escribir en Firestore ─────────────────────────────
    const { adminDb } = await import("@/lib/firebase-admin");
    const { resolveFinishedBets } = await import("@/lib/db");

    async function clearCollection(collection: string) {
      const snap = await adminDb.collection(collection).get();
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = adminDb.batch();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap.docs.slice(i, i + 400).forEach((d: any) => batch.delete(d.ref));
        await batch.commit();
      }
    }

    async function batchUpsert<T extends { id: string }>(
      collection: string,
      items: T[]
    ) {
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

    return NextResponse.json({
      ok: true,
      mode: "firebase",
      synced: {
        competitions: competitions.length,
        teams: teams.length,
        matches: matches.length,
        betsResolved: resolved,
      },
    });
  } catch (err) {
    console.error("Error en sync-matches:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
