import type {
  FantasyTeam,
  FantasyPlayer,
  FantasyNationalTeam,
  FantasyPlayerMatchStats,
  FantasyRankingEntry,
} from "@/types/fantasy";
import { FANTASY_PLAYERS } from "./mocks/fantasy-players";
import { FANTASY_NATIONAL_TEAMS } from "./mocks/fantasy-national-teams";
import { MOCK_USERS } from "./mocks/users";
import { calculateFantasyTeamPoints, getRankingLabel } from "./fantasy-scoring";

// ---------------------------------------------------------------------------
// In-memory mock stores (persist across requests in dev mode)
// ---------------------------------------------------------------------------

const MOCK_FANTASY_TEAMS: FantasyTeam[] = [];
const MOCK_FANTASY_STATS: FantasyPlayerMatchStats[] = [];

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function getPlayersByCompetition(
  competitionId: string,
): Promise<FantasyPlayer[]> {
  return FANTASY_PLAYERS.filter((p) => p.competitionId === competitionId);
}

export async function getPlayerById(
  id: string,
): Promise<FantasyPlayer | undefined> {
  return FANTASY_PLAYERS.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// National Teams
// ---------------------------------------------------------------------------

export async function getNationalTeamsByCompetition(
  competitionId: string,
): Promise<FantasyNationalTeam[]> {
  return FANTASY_NATIONAL_TEAMS.filter((t) => t.competitionId === competitionId);
}

// ---------------------------------------------------------------------------
// Fantasy Teams
// ---------------------------------------------------------------------------

export async function getFantasyTeamByUserAndCompetition(
  userId: string,
  competitionId: string,
): Promise<FantasyTeam | null> {
  return (
    MOCK_FANTASY_TEAMS.find(
      (t) => t.userId === userId && t.competitionId === competitionId,
    ) ?? null
  );
}

export async function getAllFantasyTeamsByCompetition(
  competitionId: string,
): Promise<FantasyTeam[]> {
  return MOCK_FANTASY_TEAMS.filter((t) => t.competitionId === competitionId);
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
  MOCK_FANTASY_TEAMS.push(newTeam);
  return newTeam;
}

export async function updateFantasyTeam(
  fantasyTeamId: string,
  data: Partial<FantasyTeam>,
): Promise<FantasyTeam | null> {
  const idx = MOCK_FANTASY_TEAMS.findIndex((t) => t.id === fantasyTeamId);
  if (idx === -1) return null;
  MOCK_FANTASY_TEAMS[idx] = {
    ...MOCK_FANTASY_TEAMS[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_FANTASY_TEAMS[idx];
}

export async function lockFantasyTeamsByCompetition(
  competitionId: string,
): Promise<void> {
  for (const team of MOCK_FANTASY_TEAMS) {
    if (team.competitionId === competitionId) {
      team.locked = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getFantasyPlayerStatsByCompetition(
  competitionId: string,
): Promise<FantasyPlayerMatchStats[]> {
  return MOCK_FANTASY_STATS.filter((s) => s.competitionId === competitionId);
}

export async function saveFantasyPlayerMatchStats(
  stats: Omit<FantasyPlayerMatchStats, "id">,
): Promise<FantasyPlayerMatchStats> {
  const newStats: FantasyPlayerMatchStats = {
    ...stats,
    id: `stats_${Math.random().toString(36).slice(2, 10)}`,
  };
  MOCK_FANTASY_STATS.push(newStats);

  // Update accumulated points on the player
  const player = FANTASY_PLAYERS.find((p) => p.id === stats.playerId);
  if (player) {
    player.totalFantasyPoints += newStats.fantasyPoints;
  }

  return newStats;
}

// ---------------------------------------------------------------------------
// Points recalculation
// ---------------------------------------------------------------------------

export async function updateFantasyTeamPoints(
  fantasyTeamId: string,
): Promise<void> {
  const team = MOCK_FANTASY_TEAMS.find((t) => t.id === fantasyTeamId);
  if (!team) return;

  const allStats = await getFantasyPlayerStatsByCompetition(team.competitionId);
  const statsMap = new Map<string, FantasyPlayerMatchStats>();

  // Aggregate per player across all matches
  for (const stat of allStats) {
    const existing = statsMap.get(stat.playerId);
    if (!existing) {
      statsMap.set(stat.playerId, { ...stat });
    } else {
      existing.goals += stat.goals;
      existing.assists += stat.assists;
      existing.yellowCards += stat.yellowCards;
      existing.redCards += stat.redCards;
      existing.penaltySaved += stat.penaltySaved;
      existing.penaltyMissed += stat.penaltyMissed;
      existing.minutesPlayed += stat.minutesPlayed;
      existing.mvp = existing.mvp || stat.mvp;
      existing.cleanSheet = existing.cleanSheet || stat.cleanSheet;
      existing.fantasyPoints += stat.fantasyPoints;
    }
  }

  const playersMap = new Map<string, FantasyPlayer>(
    FANTASY_PLAYERS.map((p) => [p.id, p]),
  );

  const breakdown = calculateFantasyTeamPoints(team, statsMap, playersMap, null);
  team.totalPoints = breakdown.totalPoints;
  team.updatedAt = new Date().toISOString();
}

export async function recalculateFantasyRanking(
  competitionId: string,
): Promise<void> {
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

  const sorted = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  const entries: FantasyRankingEntry[] = sorted.map((team, i) => {
    const user = MOCK_USERS.find((u) => u.id === team.userId);
    const captainPlayer = FANTASY_PLAYERS.find(
      (p) => p.id === team.captainId,
    );
    const championTeam = ntMap.get(team.championTeamId);
    const prev = i > 0 ? sorted[i - 1].totalPoints : team.totalPoints;
    const pointsDiff = i === 0 ? 0 : team.totalPoints - prev;

    return {
      rank: i + 1,
      userId: team.userId,
      displayName: user?.displayName ?? team.userId,
      teamName: team.teamName,
      totalPoints: team.totalPoints,
      captainName: captainPlayer?.name ?? "—",
      championTeamName: championTeam?.name ?? team.championTeamId,
      pointsDiff,
      label: getRankingLabel(i + 1, team.totalPoints),
    };
  });

  return entries;
}
