/**
 * Live store — datos de football-data.org en memoria.
 *
 * Se rellena llamando a GET /api/sync-matches cuando USE_MOCKS=true.
 * Mientras esté vacío, db.ts usa los mocks estáticos como fallback.
 * Se pierde al reiniciar el servidor de desarrollo (comportamiento esperado).
 */

import type { Competition, Match, Team } from "@/types/domain";

let liveCompetitions: Competition[] | null = null;
let liveTeams: Team[] | null = null;
let liveMatches: Match[] | null = null;
let lastSyncedAt: Date | null = null;

// ---------------------------------------------------------------------------
// Setters (usados por /api/sync-matches en modo mock)
// ---------------------------------------------------------------------------

export function setLiveData(data: {
  competitions: Competition[];
  teams: Team[];
  matches: Match[];
}) {
  liveCompetitions = data.competitions;
  liveTeams = data.teams;
  liveMatches = data.matches;
  lastSyncedAt = new Date();
}

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------

export function getLiveCompetitions(): Competition[] | null {
  return liveCompetitions;
}

export function getLiveTeams(): Team[] | null {
  return liveTeams;
}

export function getLiveMatches(): Match[] | null {
  return liveMatches;
}

export function getLiveSyncStatus(): {
  hasData: boolean;
  syncedAt: string | null;
  counts: { competitions: number; teams: number; matches: number } | null;
} {
  return {
    hasData: liveMatches !== null,
    syncedAt: lastSyncedAt?.toISOString() ?? null,
    counts: liveMatches
      ? {
          competitions: liveCompetitions?.length ?? 0,
          teams: liveTeams?.length ?? 0,
          matches: liveMatches.length,
        }
      : null,
  };
}
