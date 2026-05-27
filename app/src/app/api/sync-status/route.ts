/**
 * GET /api/sync-status
 * Devuelve el estado del live-store en modo mock.
 */
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.USE_MOCKS !== "true") {
    return NextResponse.json({ mode: "firebase", liveStore: null });
  }
  const { getLiveSyncStatus } = await import("@/lib/mocks/live-store");
  return NextResponse.json({ mode: "mock", liveStore: getLiveSyncStatus() });
}
