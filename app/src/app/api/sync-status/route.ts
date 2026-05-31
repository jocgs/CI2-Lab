import { NextResponse } from "next/server";
import { getMatchSyncStatus, isMatchSyncEnabled } from "@/lib/match-sync";

export async function GET() {
  if (!isMatchSyncEnabled()) {
    return NextResponse.json({ mode: "mock", enabled: false });
  }
  const status = await getMatchSyncStatus();
  return NextResponse.json({ mode: "firebase", enabled: true, ...status });
}
