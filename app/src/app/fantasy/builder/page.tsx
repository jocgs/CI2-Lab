import { getPlayersByCompetition, getNationalTeamsByCompetition } from "@/lib/fantasy-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { FantasyBuilderClient } from "./FantasyBuilderClient";

export default async function FantasyBuilderPage() {
  const [players, nationalTeams] = await Promise.all([
    getPlayersByCompetition("world_cup_2026"),
    getNationalTeamsByCompetition("world_cup_2026"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear equipo Fantasy</h1>
        <p className="text-sm text-[var(--muted)]">
          Mundial 2026 · 9 pasos: once, capitán, predicciones (incl. revelación) y confirmación
        </p>
      </div>
      <FantasyBuilderClient
        players={players}
        nationalTeams={nationalTeams}
        tournamentTeams={MOCK_TOURNAMENT_TEAMS}
        tournamentId={MOCK_TOURNAMENT.id}
        competitionId="world_cup_2026"
      />
    </div>
  );
}
