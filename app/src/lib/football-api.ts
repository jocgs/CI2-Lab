/**
 * Cliente para football-data.org v4 (free tier).
 * Sincronización centrada en el Mundial 2026 (1 llamada = toda la temporada).
 */

import type { Competition, Match, MatchResult, Outcome, Team } from "@/types/domain";

const BASE_URL = "https://api.football-data.org/v4";

const WORLD_CUP_CODE = "WC";
const WORLD_CUP_SEASON = 2026;
const CHAMPIONS_LEAGUE_CODE = "CL";

const COMPETITION_META: Record<string, { name: string; shortName: string }> = {
  WC: { name: "FIFA World Cup 2026", shortName: "Mundial" },
  CL: { name: "UEFA Champions League", shortName: "UCL" },
};

// ---------------------------------------------------------------------------
// Tipos de la API
// ---------------------------------------------------------------------------

interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest?: string;
  area?: { name: string };
}

interface FdMatch {
  id: number;
  competition: { id: number; name: string; code: string; emblem?: string };
  season: { startDate: string; endDate: string };
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  utcDate: string;
  status: string;
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    duration?: string;
    fullTime: { home: number | null; away: number | null };
    regularTime?: { home: number | null; away: number | null };
  };
}

interface FdMatchesResponse {
  matches: FdMatch[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeaders() {
  return {
    "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY ?? "",
  };
}

function mapStatus(fdStatus: string): "SCHEDULED" | "LIVE" | "FINISHED" | null {
  switch (fdStatus) {
    case "TIMED":
    case "SCHEDULED":
      return "SCHEDULED";
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":
      return "LIVE";
    case "FINISHED":
      return "FINISHED";
    default:
      return null;
  }
}

function outcomeFromGoals(home: number, away: number): Outcome {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

function resolveFinishedResult(m: FdMatch): MatchResult | undefined {
  const useRegularTime =
    m.score.duration === "PENALTY_SHOOTOUT" &&
    m.score.regularTime?.home != null &&
    m.score.regularTime?.away != null;

  const home = useRegularTime
    ? (m.score.regularTime!.home ?? 0)
    : (m.score.fullTime.home ?? 0);
  const away = useRegularTime
    ? (m.score.regularTime!.away ?? 0)
    : (m.score.fullTime.away ?? 0);

  const outcome = mapOutcome(m.score.winner) ?? outcomeFromGoals(home, away);
  return { homeGoals: home, awayGoals: away, outcome };
}

function mapOutcome(winner: string | null): Outcome | null {
  if (winner === "HOME_TEAM") return "1";
  if (winner === "AWAY_TEAM") return "2";
  if (winner === "DRAW") return "X";
  return null;
}

function mapSeason(startDate: string): string {
  const year = new Date(startDate).getFullYear();
  return `${year}/${String(year + 1).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Resultado de la sincronización
// ---------------------------------------------------------------------------

export interface SyncData {
  competitions: Competition[];
  teams: Team[];
  matches: Match[];
}

// ---------------------------------------------------------------------------
// Fetch principal
// ---------------------------------------------------------------------------

/** Todos los partidos del Mundial 2026 en una sola petición. */
export async function fetchWorldCupMatches(): Promise<SyncData> {
  const url = `${BASE_URL}/competitions/${WORLD_CUP_CODE}/matches?season=${WORLD_CUP_SEASON}`;
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 0 } });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org error ${res.status}: ${text}`);
  }

  const data: FdMatchesResponse = await res.json();
  return mapSyncData(data.matches ?? []);
}

/**
 * Champions en ventana reciente (finalizados + próximos).
 * Temporal: activar con SYNC_CHAMPIONS=true para probar porras.
 */
export async function fetchChampionsLeagueRecentMatches(): Promise<SyncData> {
  const today = new Date();
  const dateFrom = new Date(today);
  dateFrom.setDate(today.getDate() - 3);
  const dateTo = new Date(today);
  dateTo.setDate(today.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const url =
    `${BASE_URL}/matches` +
    `?competitions=${CHAMPIONS_LEAGUE_CODE}` +
    `&dateFrom=${fmt(dateFrom)}` +
    `&dateTo=${fmt(dateTo)}`;

  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org CL error ${res.status}: ${text}`);
  }

  const data: FdMatchesResponse = await res.json();
  return mapSyncData(data.matches ?? []);
}

export function mergeSyncData(...parts: SyncData[]): SyncData {
  const competitionsMap = new Map<string, Competition>();
  const teamsMap = new Map<string, Team>();
  const matchesMap = new Map<string, Match>();

  for (const part of parts) {
    for (const c of part.competitions) competitionsMap.set(c.id, c);
    for (const t of part.teams) teamsMap.set(t.id, t);
    for (const m of part.matches) matchesMap.set(m.id, m);
  }

  return {
    competitions: Array.from(competitionsMap.values()),
    teams: Array.from(teamsMap.values()),
    matches: Array.from(matchesMap.values()),
  };
}

/** Mundial + opcionalmente Champions si SYNC_CHAMPIONS=true. */
export async function fetchSyncMatches(): Promise<SyncData> {
  const wc = await fetchWorldCupMatches();
  if (process.env.SYNC_CHAMPIONS === "true") {
    const cl = await fetchChampionsLeagueRecentMatches();
    return mergeSyncData(wc, cl);
  }
  return wc;
}

/** @deprecated Usa fetchSyncMatches */
export async function fetchRecentAndUpcomingMatches(): Promise<SyncData> {
  return fetchSyncMatches();
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapSyncData(fdMatches: FdMatch[]): SyncData {
  const competitionsMap = new Map<string, Competition>();
  const teamsMap = new Map<string, Team>();
  const matches: Match[] = [];

  for (const m of fdMatches) {
    const status = mapStatus(m.status);
    if (!status) continue;

    const compCode = m.competition.code;
    const compMeta = COMPETITION_META[compCode];
    if (!compMeta) continue;

    if (!competitionsMap.has(compCode)) {
      competitionsMap.set(compCode, {
        id: `fd_comp_${compCode}`,
        name: compMeta.name,
        shortName: compMeta.shortName,
        season: mapSeason(m.season.startDate),
        logoUrl: m.competition.emblem,
      });
    }

    if (!m.homeTeam?.id || !m.awayTeam?.id) continue;

    for (const t of [m.homeTeam, m.awayTeam]) {
      const teamId = `fd_team_${t.id}`;
      if (!teamsMap.has(teamId)) {
        teamsMap.set(teamId, {
          id: teamId,
          name: t.name || `Equipo ${t.id}`,
          shortName: t.shortName || t.tla || `T${t.id}`,
          country: t.area?.name ?? "Desconocido",
          logoUrl: t.crest,
        });
      }
    }

    let result: MatchResult | undefined;
    if (status === "FINISHED") {
      result = resolveFinishedResult(m);
    }

    matches.push({
      id: `fd_match_${m.id}`,
      competitionId: `fd_comp_${compCode}`,
      homeTeamId: `fd_team_${m.homeTeam.id}`,
      awayTeamId: `fd_team_${m.awayTeam.id}`,
      kickoffAt: m.utcDate,
      status,
      ...(result ? { result } : {}),
    });
  }

  return {
    competitions: Array.from(competitionsMap.values()),
    teams: Array.from(teamsMap.values()),
    matches,
  };
}
