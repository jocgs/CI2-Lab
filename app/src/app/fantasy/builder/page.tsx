import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db";
import {
  getPlayersByCompetition,
  getNationalTeamsByCompetition,
  getFantasyLeagueById,
  getFantasyTeamForLeague,
  getGlobalFantasyTeam,
} from "@/lib/fantasy-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import { FantasyBuilderClient } from "./FantasyBuilderClient";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function FantasyBuilderPage({ searchParams }: Props) {
  const { league: leagueId } = await searchParams;
  const user = await getCurrentUser();

  const [players, nationalTeams] = await Promise.all([
    getPlayersByCompetition(COMPETITION_ID),
    getNationalTeamsByCompetition(COMPETITION_ID),
  ]);

  let leagueName: string | undefined;
  if (leagueId) {
    const league = await getFantasyLeagueById(leagueId);
    if (!league || !league.memberIds.includes(user.id)) {
      redirect("/fantasy/leagues");
    }
    const existing = await getFantasyTeamForLeague(user.id, COMPETITION_ID, leagueId);
    if (existing) {
      redirect(`/fantasy/my-team?league=${leagueId}`);
    }
    leagueName = league.name;
  } else {
    const existingGlobal = await getGlobalFantasyTeam(user.id, COMPETITION_ID);
    if (existingGlobal) {
      redirect("/fantasy/my-team");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {leagueId ? `Crear equipo · ${leagueName}` : "Crear equipo · Fantasy global"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Mundial 2026 · 9 pasos
          {leagueId
            ? " — Este once compite solo en tu liga."
            : " — Ranking general y predicciones con revelación."}
        </p>
      </div>
      <FantasyBuilderClient
        players={players}
        nationalTeams={nationalTeams}
        tournamentTeams={MOCK_TOURNAMENT_TEAMS}
        tournamentId={MOCK_TOURNAMENT.id}
        competitionId={COMPETITION_ID}
        leagueId={leagueId ?? null}
        leagueName={leagueName}
      />
    </div>
  );
}
