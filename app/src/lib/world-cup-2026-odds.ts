import oddsFile from "@/lib/data/world-cup-2026-winner-odds.json";

export interface WorldCupWinnerOddsEntry {
  id: string;
  name: string;
  group: string;
  marketOdds: number;
  americanOdds?: number;
}

export const WORLD_CUP_2026_ODDS_META = {
  source: oddsFile.source,
  updatedAt: oddsFile.updatedAt,
};

export const WORLD_CUP_2026_WINNER_ODDS: WorldCupWinnerOddsEntry[] = oddsFile.teams;

const byId = new Map(WORLD_CUP_2026_WINNER_ODDS.map((t) => [t.id, t]));

export function getWorldCupWinnerOdds(teamId: string): WorldCupWinnerOddsEntry | undefined {
  return byId.get(teamId);
}

export function getWorldCupWinnerOddsMap(): ReadonlyMap<string, WorldCupWinnerOddsEntry> {
  return byId;
}
