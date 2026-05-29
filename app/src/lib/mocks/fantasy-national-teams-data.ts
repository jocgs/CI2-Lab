import type { FantasyNationalTeam, FantasyPlayer } from "@/types/fantasy";
import { enrichNationalTeamWithCrest } from "@/lib/national-team-crests";
import { getNationalTeamFlagEmoji } from "@/lib/national-team-flags";
import { getWorldCupWinnerOddsMap } from "@/lib/world-cup-2026-odds";

const winnerOdds = getWorldCupWinnerOddsMap();

/** Catálogo de selecciones derivado del JSON de jugadores + cuotas/grupos del Mundial. */
export function buildNationalTeamsFromPlayers(
  players: FantasyPlayer[],
): FantasyNationalTeam[] {
  const byId = new Map<string, FantasyNationalTeam>();

  for (const p of players) {
    if (byId.has(p.nationalTeamId)) continue;
    const oddsEntry = winnerOdds.get(p.nationalTeamId);
    byId.set(
      p.nationalTeamId,
      enrichNationalTeamWithCrest({
        id: p.nationalTeamId,
        name: p.nationalTeamName,
        competitionId: p.competitionId,
        flagUrl: getNationalTeamFlagEmoji(p.nationalTeamId),
        group: oddsEntry?.group,
        odds: oddsEntry?.marketOdds,
      }),
    );
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}
