/**
 * GET /api/resolve-bets
 *
 * Lee los partidos de Firestore y resuelve las porras PENDING
 * de los que ya están FINISHED. No toca los datos de partidos.
 */

import { NextRequest, NextResponse } from "next/server";
import { getMatches, resolveFinishedBets } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
