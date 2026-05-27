import type { FantasyNationalTeam } from "@/types/fantasy";

function flagEmoji(cc: string): string {
  return cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export const FANTASY_NATIONAL_TEAMS: FantasyNationalTeam[] = [
  // Group A
  { id: "usa",         name: "Estados Unidos", flagUrl: flagEmoji("US"), competitionId: "world_cup_2026", group: "A", odds: 18.0 },
  { id: "canada",      name: "Canadá",          flagUrl: flagEmoji("CA"), competitionId: "world_cup_2026", group: "A", odds: 30.0 },
  { id: "morocco",     name: "Marruecos",        flagUrl: flagEmoji("MA"), competitionId: "world_cup_2026", group: "A", odds: 14.0 },
  { id: "croatia",     name: "Croacia",          flagUrl: flagEmoji("HR"), competitionId: "world_cup_2026", group: "A", odds: 12.0 },

  // Group B
  { id: "spain",       name: "España",           flagUrl: flagEmoji("ES"), competitionId: "world_cup_2026", group: "B", odds: 5.0 },
  { id: "germany",     name: "Alemania",         flagUrl: flagEmoji("DE"), competitionId: "world_cup_2026", group: "B", odds: 7.0 },
  { id: "japan",       name: "Japón",            flagUrl: flagEmoji("JP"), competitionId: "world_cup_2026", group: "B", odds: 20.0 },
  { id: "australia",   name: "Australia",        flagUrl: flagEmoji("AU"), competitionId: "world_cup_2026", group: "B", odds: 40.0 },

  // Group C
  { id: "france",      name: "Francia",          flagUrl: flagEmoji("FR"), competitionId: "world_cup_2026", group: "C", odds: 4.5 },
  { id: "portugal",    name: "Portugal",         flagUrl: flagEmoji("PT"), competitionId: "world_cup_2026", group: "C", odds: 8.0 },
  { id: "mexico",      name: "México",           flagUrl: flagEmoji("MX"), competitionId: "world_cup_2026", group: "C", odds: 22.0 },
  { id: "italy",       name: "Italia",           flagUrl: flagEmoji("IT"), competitionId: "world_cup_2026", group: "C", odds: 10.0 },

  // Group D
  { id: "brazil",      name: "Brasil",           flagUrl: flagEmoji("BR"), competitionId: "world_cup_2026", group: "D", odds: 3.5 },
  { id: "argentina",   name: "Argentina",        flagUrl: flagEmoji("AR"), competitionId: "world_cup_2026", group: "D", odds: 4.0 },
  { id: "england",     name: "Inglaterra",       flagUrl: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",      competitionId: "world_cup_2026", group: "D", odds: 6.0 },
  { id: "netherlands", name: "Países Bajos",     flagUrl: flagEmoji("NL"), competitionId: "world_cup_2026", group: "D", odds: 9.0 },
];
