/**
 * Cliente para football-data.org v4 (free tier).
 * Competiciones gratuitas usadas: LaLiga (PD) y Champions League (CL).
 */

import type { Competition, Match, MatchResult, Team } from "@/types/domain";

const BASE_URL = "https://api.football-data.org/v4";

// Competiciones por ventana de fechas (máx 10 días en free tier)
const DATE_RANGE_CODES = ["PD", "CL"] as const;

// Competiciones que se obtienen por estado (sin límite de fechas)
const STATUS_CODES = ["WC"] as const;

const COMPETITION_META: Record<string, { name: string; shortName: string }> = {
  PD: { name: "LaLiga EA Sports", shortName: "LaLiga" },
  CL: { name: "UEFA Champions League", shortName: "UCL" },
  WC: { name: "FIFA World Cup 2026", shortName: "Mundial" },
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
    fullTime: { home: number | null; away: number | null };
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
      return null; // POSTPONED, CANCELLED, SUSPENDED → ignorar
  }
}

function mapOutcome(winner: string | null): "1" | "X" | "2" | null {
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

/**
 * Obtiene partidos de LaLiga + CL (ventana 9 días)
 * y todos los partidos del Mundial 2026 programados.
 */
export async function fetchRecentAndUpcomingMatches(): Promise<SyncData> {
  const today = new Date();
  const dateFrom = new Date(today);
  dateFrom.setDate(today.getDate() - 3);
  const dateTo = new Date(today);
  dateTo.setDate(today.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Llamada 1: LaLiga + CL en ventana de fechas (max 10 días)
  const url1 =
    `${BASE_URL}/matches` +
    `?competitions=${DATE_RANGE_CODES.join(",")}` +
    `&dateFrom=${fmt(dateFrom)}` +
    `&dateTo=${fmt(dateTo)}`;

  const res1 = await fetch(url1, { headers: getHeaders(), next: { revalidate: 0 } });
  if (!res1.ok) {
    const text = await res1.text();
    throw new Error(`football-data.org error ${res1.status}: ${text}`);
  }
  const data1: FdMatchesResponse = await res1.json();
  const allFdMatches: FdMatch[] = [...data1.matches];

  // Llamada 2: Mundial — todos los partidos de la temporada 2026
  for (const code of STATUS_CODES) {
    const url2 = `${BASE_URL}/competitions/${code}/matches?season=2026`;
    const res2 = await fetch(url2, { headers: getHeaders(), next: { revalidate: 0 } });
    if (res2.ok) {
      const data2: FdMatchesResponse = await res2.json();
      allFdMatches.push(...data2.matches);
    }
  }

  return mapSyncData(allFdMatches);
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
    if (!status) continue; // ignorar partidos cancelados/postpuestos

    const compCode = m.competition.code;
    const compMeta = COMPETITION_META[compCode];
    if (!compMeta) continue; // solo las competiciones configuradas

    // Competición
    if (!competitionsMap.has(compCode)) {
      competitionsMap.set(compCode, {
        id: `fd_comp_${compCode}`,
        name: compMeta.name,
        shortName: compMeta.shortName,
        season: mapSeason(m.season.startDate),
        logoUrl: m.competition.emblem,
      });
    }

    // Saltar partidos con equipos placeholder (fase eliminatoria sin definir)
    if (!m.homeTeam?.id || !m.awayTeam?.id) continue;

    // Equipos
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

    // Resultado
    let result: MatchResult | undefined;
    if (status === "FINISHED") {
      const home = m.score.fullTime.home ?? 0;
      const away = m.score.fullTime.away ?? 0;
      const outcome = mapOutcome(m.score.winner);
      if (outcome) {
        result = { homeGoals: home, awayGoals: away, outcome };
      }
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
