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
  {
    id: "usa",
    name: "Estados Unidos",
    flagUrl: flagEmoji("US"),
    competitionId: "world_cup_2026",
    group: "A",
  },
  {
    id: "canada",
    name: "Canadá",
    flagUrl: flagEmoji("CA"),
    competitionId: "world_cup_2026",
    group: "A",
  },
  {
    id: "morocco",
    name: "Marruecos",
    flagUrl: flagEmoji("MA"),
    competitionId: "world_cup_2026",
    group: "A",
  },
  {
    id: "croatia",
    name: "Croacia",
    flagUrl: flagEmoji("HR"),
    competitionId: "world_cup_2026",
    group: "A",
  },

  // Group B
  {
    id: "spain",
    name: "España",
    flagUrl: flagEmoji("ES"),
    competitionId: "world_cup_2026",
    group: "B",
  },
  {
    id: "germany",
    name: "Alemania",
    flagUrl: flagEmoji("DE"),
    competitionId: "world_cup_2026",
    group: "B",
  },
  {
    id: "japan",
    name: "Japón",
    flagUrl: flagEmoji("JP"),
    competitionId: "world_cup_2026",
    group: "B",
  },
  {
    id: "australia",
    name: "Australia",
    flagUrl: flagEmoji("AU"),
    competitionId: "world_cup_2026",
    group: "B",
  },

  // Group C
  {
    id: "france",
    name: "Francia",
    flagUrl: flagEmoji("FR"),
    competitionId: "world_cup_2026",
    group: "C",
  },
  {
    id: "portugal",
    name: "Portugal",
    flagUrl: flagEmoji("PT"),
    competitionId: "world_cup_2026",
    group: "C",
  },
  {
    id: "mexico",
    name: "México",
    flagUrl: flagEmoji("MX"),
    competitionId: "world_cup_2026",
    group: "C",
  },
  {
    id: "italy",
    name: "Italia",
    flagUrl: flagEmoji("IT"),
    competitionId: "world_cup_2026",
    group: "C",
  },

  // Group D
  {
    id: "brazil",
    name: "Brasil",
    flagUrl: flagEmoji("BR"),
    competitionId: "world_cup_2026",
    group: "D",
  },
  {
    id: "argentina",
    name: "Argentina",
    flagUrl: flagEmoji("AR"),
    competitionId: "world_cup_2026",
    group: "D",
  },
  {
    id: "england",
    name: "Inglaterra",
    flagUrl: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    competitionId: "world_cup_2026",
    group: "D",
  },
  {
    id: "netherlands",
    name: "Países Bajos",
    flagUrl: flagEmoji("NL"),
    competitionId: "world_cup_2026",
    group: "D",
  },
];
