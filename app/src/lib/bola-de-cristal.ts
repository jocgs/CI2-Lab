import type { TournamentTeam } from "@/types/picks";
import type { UserTournamentPicks } from "@/types/picks";
import type { FantasyTeam } from "@/types/fantasy";

/** Selecciones UEFA (Europa) en el Mundial 2026. */
export const UEFA_TEAM_IDS = new Set([
  "austria",
  "belgium",
  "bosnia",
  "croatia",
  "czech_republic",
  "england",
  "france",
  "germany",
  "netherlands",
  "norway",
  "portugal",
  "scotland",
  "spain",
  "sweden",
  "switzerland",
  "turkey",
]);

/** Selecciones CONMEBOL (Sudamérica). */
export const CONMEBOL_TEAM_IDS = new Set([
  "argentina",
  "brazil",
  "colombia",
  "ecuador",
  "paraguay",
  "uruguay",
]);

export function isUefaOrConmebolTeam(teamId: string): boolean {
  return UEFA_TEAM_IDS.has(teamId) || CONMEBOL_TEAM_IDS.has(teamId);
}

export function getTeamsOutsideUefaConmebol(teams: TournamentTeam[]): TournamentTeam[] {
  return teams.filter((t) => !isUefaOrConmebolTeam(t.id));
}

export function isBolaDeCristalGlobalComplete(
  team: FantasyTeam,
  picks: UserTournamentPicks | null,
): boolean {
  if (!picks) return false;
  return Boolean(
    team.championTeamId &&
      team.disappointmentTeamId &&
      picks.revelationTeamId &&
      picks.ballonDOrPlayerId &&
      picks.goldenBootPlayerId &&
      picks.goldenGlovePlayerId &&
      picks.bestYoungPlayerId &&
      picks.topAssistPlayerId &&
      picks.bestGoalTeamId &&
      picks.bestGroupStageTeamId &&
      picks.worstGroupStageTeamId &&
      picks.bestNonUefaConmebolTeamId,
  );
}

export function isBolaDeCristalLeagueComplete(team: FantasyTeam): boolean {
  return Boolean(team.championTeamId && team.disappointmentTeamId);
}
