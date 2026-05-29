import Link from "next/link";
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
import { getUserTournamentPicks } from "@/lib/picks-db";
import { isFantasyTeamEditable } from "@/lib/fantasy-lock";
import { FantasyBuilderClient } from "./FantasyBuilderClient";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  searchParams: Promise<{ league?: string; edit?: string }>;
}

export default async function FantasyBuilderPage({ searchParams }: Props) {
  const { league: leagueId, edit: editParam } = await searchParams;
  const isEditMode = editParam === "1";
  const user = await getCurrentUser();

  const [players, nationalTeams] = await Promise.all([
    getPlayersByCompetition(COMPETITION_ID),
    getNationalTeamsByCompetition(COMPETITION_ID),
  ]);

  let leagueName: string | undefined;
  let existingTeam = null;
  let initialRevelationTeamId: string | null = null;

  if (leagueId) {
    const league = await getFantasyLeagueById(leagueId);
    if (!league || !league.memberIds.includes(user.id)) {
      redirect("/fantasy/leagues");
    }
    existingTeam = await getFantasyTeamForLeague(user.id, COMPETITION_ID, leagueId);
    leagueName = league.name;
  } else {
    existingTeam = await getGlobalFantasyTeam(user.id, COMPETITION_ID);
    const myPicks = await getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id);
    initialRevelationTeamId = myPicks?.revelationTeamId ?? null;
  }

  const myTeamHref = leagueId ? `/fantasy/my-team?league=${leagueId}` : "/fantasy/my-team";

  if (existingTeam) {
    if (!isEditMode) {
      redirect(myTeamHref);
    }
    if (!isFantasyTeamEditable(existingTeam)) {
      redirect(myTeamHref);
    }
  } else if (isEditMode) {
    redirect(myTeamHref);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditMode
            ? leagueId
              ? `Editar equipo · ${leagueName}`
              : "Editar equipo · Fantasy global"
            : leagueId
              ? `Crear equipo · ${leagueName}`
              : "Crear equipo · Fantasy global"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Mundial 2026 · 9 pasos
          {isEditMode && (
            <>
              {" "}
              · Puedes cambiar la plantilla hasta el inicio del torneo.{" "}
              <Link href={myTeamHref} className="text-[var(--brand)] hover:underline">
                Volver a mi equipo
              </Link>
            </>
          )}
          {!isEditMode && leagueId && " — Este once compite solo en tu liga."}
          {!isEditMode && !leagueId && " — Ranking general y predicciones con revelación."}
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
        existingTeam={existingTeam}
        editMode={isEditMode}
        initialRevelationTeamId={initialRevelationTeamId}
      />
    </div>
  );
}
