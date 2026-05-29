import type {
  FantasyTeam,
  FantasyLeague,
  FantasyLeagueRankingEntry,
  FantasyPlayer,
  FantasyNationalTeam,
  FantasyPlayerMatchStats,
  FantasyRankingEntry,
} from "@/types/fantasy";
import { unstable_cache } from "next/cache";
import { FANTASY_PLAYERS } from "./mocks/fantasy-players-data";
import { buildNationalTeamsFromPlayers } from "./mocks/fantasy-national-teams-data";
import * as fs from "./data-store";

const FANTASY_NATIONAL_TEAMS = buildNationalTeamsFromPlayers(FANTASY_PLAYERS);
import { calculateFantasyTeamPoints, getRankingLabel } from "./fantasy-scoring";

// Jugadores y selecciones: catálogo estático en src/lib/data/jugadores.json.
// Los equipos fantasy, ligas y estadísticas son dinámicos → Firestore.

// ---------------------------------------------------------------------------
// Jugadores (datos estáticos del mock)
// ---------------------------------------------------------------------------

// Cache agresiva: catálogo prácticamente estático.
export const getPlayersByCompetition = unstable_cache(
  async (competitionId: string): Promise<FantasyPlayer[]> =>
    FANTASY_PLAYERS.filter((p) => p.competitionId === competitionId),
  ["fantasy:getPlayersByCompetition"],
  { revalidate: 60 * 60 * 24 }, // 24h
);

export async function getPlayerById(id: string): Promise<FantasyPlayer | undefined> {
  return FANTASY_PLAYERS.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Selecciones nacionales (datos estáticos del mock)
// ---------------------------------------------------------------------------

// Cache agresiva: catálogo prácticamente estático.
export const getNationalTeamsByCompetition = unstable_cache(
  async (competitionId: string): Promise<FantasyNationalTeam[]> =>
    FANTASY_NATIONAL_TEAMS.filter((t) => t.competitionId === competitionId),
  ["fantasy:getNationalTeamsByCompetition"],
  { revalidate: 60 * 60 * 24 }, // 24h
);

// ---------------------------------------------------------------------------
// Equipos Fantasy → Firestore
// ---------------------------------------------------------------------------

export function isGlobalFantasyTeam(team: FantasyTeam): boolean {
  return team.leagueId == null;
}

export async function getFantasyTeamsByUser(
  userId: string,
  competitionId: string,
): Promise<FantasyTeam[]> {
  const teams = await getAllFantasyTeamsByCompetition(competitionId);
  return teams.filter((t) => t.userId === userId);
}

/** Equipo del ranking global (sin liga). */
export async function getGlobalFantasyTeam(
  userId: string,
  competitionId: string,
): Promise<FantasyTeam | null> {
  const teams = await getFantasyTeamsByUser(userId, competitionId);
  return teams.find(isGlobalFantasyTeam) ?? null;
}

/** Equipo asociado a una liga concreta. */
export async function getFantasyTeamForLeague(
  userId: string,
  competitionId: string,
  leagueId: string,
): Promise<FantasyTeam | null> {
  const teams = await getFantasyTeamsByUser(userId, competitionId);
  return teams.find((t) => t.leagueId === leagueId) ?? null;
}

/** @deprecated Usa `getGlobalFantasyTeam` — mantiene compatibilidad con código existente. */
export async function getFantasyTeamByUserAndCompetition(
  userId: string,
  competitionId: string,
): Promise<FantasyTeam | null> {
  return getGlobalFantasyTeam(userId, competitionId);
}

// Cache corta: reduce “saltos” entre secciones en móvil (navegación).
export const getAllFantasyTeamsByCompetition = unstable_cache(
  async (competitionId: string): Promise<FantasyTeam[]> =>
    fs.queryWhere<FantasyTeam>("fantasy_teams", "competitionId", competitionId),
  ["fantasy:getAllFantasyTeamsByCompetition"],
  { revalidate: 5 }, // 5s
);

export async function createFantasyTeam(
  data: Omit<FantasyTeam, "id" | "totalPoints" | "createdAt" | "updatedAt" | "locked">,
): Promise<FantasyTeam> {
  const now = new Date().toISOString();
  const newTeam: FantasyTeam = {
    ...data,
    leagueId: data.leagueId ?? null,
    id: `fantasy_team_${Math.random().toString(36).slice(2, 10)}`,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
    locked: false,
  };
  return fs.insert("fantasy_teams", newTeam);
}

export async function getFantasyTeamById(id: string): Promise<FantasyTeam | null> {
  return (await fs.getById<FantasyTeam>("fantasy_teams", id)) ?? null;
}

export async function updateFantasyTeam(
  fantasyTeamId: string,
  data: Partial<FantasyTeam>,
): Promise<FantasyTeam | null> {
  const existing = await fs.getById<FantasyTeam>("fantasy_teams", fantasyTeamId);
  if (!existing) return null;
  const updated: FantasyTeam = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await fs.upsert("fantasy_teams", updated);
  return updated;
}

export async function lockFantasyTeamsByCompetition(competitionId: string): Promise<void> {
  const teams = await getAllFantasyTeamsByCompetition(competitionId);
  await Promise.all(
    teams.map((t) => fs.patch("fantasy_teams", t.id, { locked: true })),
  );
}

// ---------------------------------------------------------------------------
// Estadísticas → Firestore
// ---------------------------------------------------------------------------

export async function getFantasyPlayerStatsByCompetition(
  competitionId: string,
): Promise<FantasyPlayerMatchStats[]> {
  return fs.queryWhere<FantasyPlayerMatchStats>("fantasy_stats", "competitionId", competitionId);
}

export async function saveFantasyPlayerMatchStats(
  stats: Omit<FantasyPlayerMatchStats, "id">,
): Promise<FantasyPlayerMatchStats> {
  // ID determinista por (playerId, matchId) — evita duplicados si se llama dos veces
  const statsWithId: FantasyPlayerMatchStats = {
    ...stats,
    id: `${stats.playerId}_${stats.matchId}`,
  };
  await fs.upsert("fantasy_stats", statsWithId);
  return statsWithId;
}

// ---------------------------------------------------------------------------
// Recálculo de puntos
// ---------------------------------------------------------------------------

export async function updateFantasyTeamPoints(fantasyTeamId: string): Promise<void> {
  const team = await fs.getById<FantasyTeam>("fantasy_teams", fantasyTeamId);
  if (!team) return;

  const allStats = await getFantasyPlayerStatsByCompetition(team.competitionId);

  // Agregamos por jugador
  const statsMap = new Map<string, FantasyPlayerMatchStats>();
  for (const stat of allStats) {
    const existing = statsMap.get(stat.playerId);
    if (!existing) {
      statsMap.set(stat.playerId, { ...stat });
    } else {
      existing.goals          += stat.goals;
      existing.assists        += stat.assists;
      existing.yellowCards    += stat.yellowCards;
      existing.redCards       += stat.redCards;
      existing.penaltySaved   += stat.penaltySaved;
      existing.penaltyMissed  += stat.penaltyMissed;
      existing.minutesPlayed  += stat.minutesPlayed;
      existing.mvp             = existing.mvp || stat.mvp;
      existing.cleanSheet      = existing.cleanSheet || stat.cleanSheet;
      existing.fantasyPoints  += stat.fantasyPoints;
    }
  }

  const playersMap = new Map<string, FantasyPlayer>(FANTASY_PLAYERS.map((p) => [p.id, p]));
  const breakdown = calculateFantasyTeamPoints(team, statsMap, playersMap, null);

  await fs.patch("fantasy_teams", fantasyTeamId, {
    totalPoints: breakdown.totalPoints,
    updatedAt: new Date().toISOString(),
  });
}

export async function recalculateFantasyRanking(competitionId: string): Promise<void> {
  const teams = await getAllFantasyTeamsByCompetition(competitionId);
  await Promise.all(teams.map((t) => updateFantasyTeamPoints(t.id)));
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

async function buildRankingEntriesFromTeams(
  teams: FantasyTeam[],
  competitionId: string,
): Promise<FantasyRankingEntry[]> {
  const nationalTeams = await getNationalTeamsByCompetition(competitionId);
  const ntMap = new Map(nationalTeams.map((nt) => [nt.id, nt]));

  // Obtenemos los usuarios de Firestore para los display names
  const userIds = [...new Set(teams.map((t) => t.userId))];
  const userDocs = await Promise.all(
    userIds.map((id) => fs.getById<{ id: string; displayName: string }>("users", id)),
  );
  const userMap = new Map(
    userDocs
      .filter((u): u is { id: string; displayName: string } => Boolean(u))
      .map((u) => [u.id, u.displayName]),
  );

  const sorted = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  return sorted.map((team, i) => {
    const captainPlayer = FANTASY_PLAYERS.find((p) => p.id === team.captainId);
    const championTeam  = team.championTeamId ? ntMap.get(team.championTeamId) : undefined;
    const prev          = i > 0 ? sorted[i - 1].totalPoints : team.totalPoints;
    const pointsDiff    = i === 0 ? 0 : team.totalPoints - prev;

    return {
      rank: i + 1,
      userId: team.userId,
      displayName: userMap.get(team.userId) ?? team.userId,
      teamName: team.teamName,
      totalPoints: team.totalPoints,
      captainName: captainPlayer?.name ?? "—",
      championTeamName: championTeam?.name ?? team.championTeamId ?? "—",
      pointsDiff,
      label: getRankingLabel(i + 1, team.totalPoints),
    };
  });
}

export async function getFantasyRankingByCompetition(
  competitionId: string,
): Promise<FantasyRankingEntry[]> {
  // Cache corta: ranking no necesita frescura instantánea en navegación.
  return unstable_cache(
    async (cid: string): Promise<FantasyRankingEntry[]> => {
      const allTeams = await getAllFantasyTeamsByCompetition(cid);
      const teams = allTeams.filter(isGlobalFantasyTeam);
      return buildRankingEntriesFromTeams(teams, cid);
    },
    ["fantasy:getFantasyRankingByCompetition"],
    { revalidate: 5 },
  )(competitionId);
}

// ---------------------------------------------------------------------------
// Ligas → Firestore
// ---------------------------------------------------------------------------

function makeInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function getLeaguesByUserId(userId: string): Promise<FantasyLeague[]> {
  return fs.queryWhereArrayContains<FantasyLeague>("fantasy_leagues", "memberIds", userId);
}

export async function getFantasyLeagueById(id: string): Promise<FantasyLeague | null> {
  return (await fs.getById<FantasyLeague>("fantasy_leagues", id)) ?? null;
}

export async function getFantasyLeagueByInviteCode(code: string): Promise<FantasyLeague | null> {
  return (
    (await fs.queryWhereOne<FantasyLeague>(
      "fantasy_leagues",
      "inviteCode",
      code.toUpperCase(),
    )) ?? null
  );
}

export async function createFantasyLeague(data: {
  name: string;
  competitionId: string;
  ownerId: string;
}): Promise<FantasyLeague> {
  const league: FantasyLeague = {
    id: `league_${Math.random().toString(36).slice(2, 10)}`,
    name: data.name,
    competitionId: data.competitionId,
    ownerId: data.ownerId,
    memberIds: [data.ownerId],
    inviteCode: makeInviteCode(),
    createdAt: new Date().toISOString(),
  };
  return fs.insert("fantasy_leagues", league);
}

export async function joinFantasyLeague(
  leagueId: string,
  userId: string,
): Promise<{ error?: string }> {
  const league = await fs.getById<FantasyLeague>("fantasy_leagues", leagueId);
  if (!league) return { error: "Liga no encontrada." };
  if (league.memberIds.includes(userId)) return { error: "Ya eres miembro de esta liga." };
  await fs.patch("fantasy_leagues", leagueId, { memberIds: [...league.memberIds, userId] });
  return {};
}

export async function leaveFantasyLeague(
  leagueId: string,
  userId: string,
): Promise<{ error?: string }> {
  const league = await fs.getById<FantasyLeague>("fantasy_leagues", leagueId);
  if (!league) return { error: "Liga no encontrada." };
  if (league.ownerId === userId) return { error: "El creador no puede abandonar la liga." };
  await fs.patch("fantasy_leagues", leagueId, {
    memberIds: league.memberIds.filter((id) => id !== userId),
  });
  return {};
}

export async function getFantasyLeagueRanking(leagueId: string): Promise<FantasyLeagueRankingEntry[]> {
  // Cache corta: evita recalcular en cada navegación de móvil.
  return unstable_cache(
    async (lid: string): Promise<FantasyLeagueRankingEntry[]> => {
      const league = await getFantasyLeagueById(lid);
      if (!league) return [];

      const allTeams = await getAllFantasyTeamsByCompetition(league.competitionId);
      const leagueTeams = allTeams.filter(
        (t) => t.leagueId === lid && league.memberIds.includes(t.userId),
      );
      const entries = await buildRankingEntriesFromTeams(leagueTeams, league.competitionId);

      return entries.map((e, i) => ({ ...e, leagueRank: i + 1 }));
    },
    ["fantasy:getFantasyLeagueRanking"],
    { revalidate: 5 },
  )(leagueId);
}
