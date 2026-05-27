import type { TournamentTeam, Tournament } from "@/types/picks";

export const MOCK_TOURNAMENT: Tournament = {
  id: "world_cup_2026",
  name: "Mundial 2026",
  startsAt: "2026-06-11T18:00:00.000Z",
  oddsLockedAt: "2026-06-11T18:00:00.000Z",
};

export const MOCK_TOURNAMENT_TEAMS: TournamentTeam[] = [
  { id: "france",      name: "Francia",          flag: "🇫🇷", marketOdds: 6,   group: "A" },
  { id: "brazil",      name: "Brasil",            flag: "🇧🇷", marketOdds: 7,   group: "B" },
  { id: "england",     name: "Inglaterra",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", marketOdds: 8,   group: "C" },
  { id: "spain",       name: "España",            flag: "🇪🇸", marketOdds: 9,   group: "D" },
  { id: "argentina",   name: "Argentina",         flag: "🇦🇷", marketOdds: 10,  group: "E" },
  { id: "germany",     name: "Alemania",          flag: "🇩🇪", marketOdds: 14,  group: "F" },
  { id: "portugal",    name: "Portugal",          flag: "🇵🇹", marketOdds: 16,  group: "G" },
  { id: "netherlands", name: "Países Bajos",      flag: "🇳🇱", marketOdds: 22,  group: "H" },
  { id: "croatia",     name: "Croacia",           flag: "🇭🇷", marketOdds: 35,  group: "A" },
  { id: "morocco",     name: "Marruecos",         flag: "🇲🇦", marketOdds: 45,  group: "B" },
  { id: "usa",         name: "Estados Unidos",    flag: "🇺🇸", marketOdds: 65,  group: "C" },
  { id: "mexico",      name: "México",            flag: "🇲🇽", marketOdds: 70,  group: "D" },
  { id: "japan",       name: "Japón",             flag: "🇯🇵", marketOdds: 80,  group: "E" },
  { id: "senegal",     name: "Senegal",           flag: "🇸🇳", marketOdds: 90,  group: "F" },
  { id: "panama",      name: "Panamá",            flag: "🇵🇦", marketOdds: 300, group: "G" },
];
