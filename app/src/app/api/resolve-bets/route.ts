/**
 * GET /api/resolve-bets
 *
 * Lee los partidos de Firestore y resuelve las porras PENDING
 * de los que ya están FINISHED. No toca los datos de partidos.
 */

import { NextResponse } from "next/server";
import { getMatches, resolveFinishedBets } from "@/lib/db";

export async function GET() {
  try {
    const matches = await getMatches();
    const { resolved } = await resolveFinishedBets(matches);

    const finished = matches.filter((m) => m.status === "FINISHED").length;

    return NextResponse.json({
      ok: true,
      matchesFinished: finished,
      betsResolved: resolved,
    });
  } catch (err) {
    console.error("Error en resolve-bets:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
