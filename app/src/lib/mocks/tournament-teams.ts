import type { TournamentTeam, Tournament } from "@/types/picks";
import { getNationalTeamCrestUrl } from "@/lib/national-team-crests";
import { getNationalTeamFlagEmoji } from "@/lib/national-team-flags";
import { WORLD_CUP_2026_WINNER_ODDS } from "@/lib/world-cup-2026-odds";

function withCrest(team: Omit<TournamentTeam, "crestUrl">): TournamentTeam {
  return { ...team, crestUrl: getNationalTeamCrestUrl(team.id) };
}

export const MOCK_TOURNAMENT: Tournament = {
  id: "world_cup_2026",
  name: "Mundial 2026",
  startsAt: "2026-06-11T18:00:00.000Z",
  oddsLockedAt: "2026-06-11T18:00:00.000Z",
};

const RAW_TOURNAMENT_TEAMS: Omit<TournamentTeam, "crestUrl">[] = WORLD_CUP_2026_WINNER_ODDS.map(
  (entry) => ({
    id: entry.id,
    name: entry.name,
    flag: getNationalTeamFlagEmoji(entry.id),
    marketOdds: entry.marketOdds,
    group: entry.group,
  }),
);

export const MOCK_TOURNAMENT_TEAMS: TournamentTeam[] = RAW_TOURNAMENT_TEAMS.map(withCrest);
