import type {
  FantasyTeam,
  FantasyLeague,
  FantasyLeagueRankingEntry,
  FantasyPlayer,
  FantasyNationalTeam,
  FantasyPlayerMatchStats,
  FantasyRankingEntry,
} from "@/types/fantasy";
import { FANTASY_PLAYERS } from "./mocks/fantasy-players-data";
import { FANTASY_NATIONAL_TEAMS } from "./mocks/fantasy-national-teams";
import * as fs from "./data-store";
import { calculateFantasyTeamPoints, getRankingLabel } from "./fantasy-scoring";

// Los jugadores y selecciones son datos estáticos (seed); se leen del mock.
// Los equipos fantasy, ligas y estadísticas son dinámicos → Firestore.

// ---------------------------------------------------------------------------
// Jugadores (datos estáticos del mock)
// ---------------------------------------------------------------------------

export async function getPlayersByCompetition(competitionId: string): Promise<FantasyPlayer[]> {
  return FANTASY_PLAYERS.filter((p) => p.competitionId === competitionId);
}

export async function getPlayerById(id: string): Promise<FantasyPlayer | undefined> {
  return FANTASY_PLAYERS.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Selecciones nacionales (datos estáticos del mock)
// ---------------------------------------------------------------------------

export async function getNationalTeamsByCompetition(competitionId: string): Promise<FantasyNationalTeam[]> {
  return FANTASY_NATIONAL_TEAMS.filter((t) => t.competitionId === competitionId);
}

// ---------------------------------------------------------------------------
// Equipos Fantasy → Firestore
// ---------------------------------------------------------------------------

export async function getFantasyTeamByUserAndCompetition(
  userId: string,
  competitionId: string,
): Promise<FantasyTeam | null> {
  const result = await fs.queryWhereCompoundOne<FantasyTeam>("fantasy_teams", [
    ["userId", userId],
    ["competitionId", competitionId],
  ]);
  return result ?? null;
}

export async function getAllFantasyTeamsByCompetition(competitionId: string): Promise<FantasyTeam[]> {
  return fs.queryWhere<FantasyTeam>("fantasy_teams", "competitionId", competitionId);
}

export async function createFantasyTeam(
  data: Omit<FantasyTeam, "id" | "totalPoints" | "createdAt" | "updatedAt" | "locked">,
): Promise<FantasyTeam> {
  const now = new Date().toISOString();
  const newTeam: FantasyTeam = {
    ...data,
    id: `fantasy_team_${Math.random().toString(36).slice(2, 10)}`,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
    locked: false,
  };
  return fs.insert("fantasy_teams", newTeam);
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
  const newStats: FantasyPlayerMatchStats = {
    ...stats,
    id: `stats_${Math.random().toString(36).slice(2, 10)}`,
  };
  await fs.insert("fantasy_stats", newStats);
  return newStats;
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

export async function getFantasyRankingByCompetition(
  competitionId: string,
): Promise<FantasyRankingEntry[]> {
  const teams = await getAllFantasyTeamsByCompetition(competitionId);
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
  const league = await getFantasyLeagueById(leagueId);
  if (!league) return [];

  const allEntries = await getFantasyRankingByCompetition(league.competitionId);
  const leagueEntries = allEntries.filter((e) => league.memberIds.includes(e.userId));

  return leagueEntries.map((e, i) => ({ ...e, leagueRank: i + 1 }));
}
