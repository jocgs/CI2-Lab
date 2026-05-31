import { getNationalTeamCrestUrl } from "@/lib/national-team-crests";
import { WORLD_CUP_2026_WINNER_ODDS } from "@/lib/world-cup-2026-odds";
import type { BracketTeamInfo } from "@/types/bracket-prediction";

export const WORLD_CUP_GROUP_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

export type WorldCupGroupLetter = (typeof WORLD_CUP_GROUP_LETTERS)[number];

const teamsByGroup = new Map<string, BracketTeamInfo[]>();

for (const entry of WORLD_CUP_2026_WINNER_ODDS) {
  if (!entry.group) continue;
  const team: BracketTeamInfo = {
    id: entry.id,
    name: entry.name,
    group: entry.group,
    marketOdds: entry.marketOdds,
    crestUrl: getNationalTeamCrestUrl(entry.id),
  };
  const list = teamsByGroup.get(entry.group) ?? [];
  list.push(team);
  teamsByGroup.set(entry.group, list);
}

/** Selecciones del Mundial 2026 agrupadas por letra (A–L). */
export function getWorldCupGroups(): Record<WorldCupGroupLetter, BracketTeamInfo[]> {
  const result = {} as Record<WorldCupGroupLetter, BracketTeamInfo[]>;
  for (const letter of WORLD_CUP_GROUP_LETTERS) {
    result[letter] = (teamsByGroup.get(letter) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }
  return result;
}

export function getWorldCupTeamMap(): Map<string, BracketTeamInfo> {
  const map = new Map<string, BracketTeamInfo>();
  for (const teams of teamsByGroup.values()) {
    for (const team of teams) {
      map.set(team.id, team);
    }
  }
  return map;
}

export function getWorldCupTeamById(teamId: string): BracketTeamInfo | undefined {
  return getWorldCupTeamMap().get(teamId);
}
