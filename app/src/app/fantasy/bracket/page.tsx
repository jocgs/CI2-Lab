import { getCurrentUser } from "@/lib/db";
import { getUserWorldCupBracketPrediction } from "@/lib/bracket-prediction-db";
import { getWorldCupGroups } from "@/lib/world-cup-groups";
import { isBracketComplete, BRACKET_MATCH_ROUNDS } from "@/lib/world-cup-bracket";
import { getWorldCupBracketOfficialAnswers } from "@/lib/world-cup-bracket-official-answers";
import { evaluateWorldCupBracketScore } from "@/lib/world-cup-bracket-scoring";
import { MOCK_TOURNAMENT } from "@/lib/mocks/tournament-teams";
import { isFantasyCompetitionLocked } from "@/lib/fantasy-lock";
import { BracketPredictorClient } from "./BracketPredictorClient";

export default async function WorldCupBracketPage() {
  const user = await getCurrentUser();
  const [groups, existing, official] = await Promise.all([
    Promise.resolve(getWorldCupGroups()),
    getUserWorldCupBracketPrediction(user.id, MOCK_TOURNAMENT.id),
    Promise.resolve(getWorldCupBracketOfficialAnswers(MOCK_TOURNAMENT.id)),
  ]);

  const locked = isFantasyCompetitionLocked();
  const hasSavedBracket =
    existing !== null &&
    isBracketComplete({
      groupStandings: existing.groupStandings,
      qualifyingThirdGroups: existing.qualifyingThirdGroups ?? [],
      knockoutWinners: existing.knockoutWinners,
    });

  const score = evaluateWorldCupBracketScore(
    existing ?? {
      userId: user.id,
      tournamentId: MOCK_TOURNAMENT.id,
      groupStandings: {},
      qualifyingThirdGroups: [],
      knockoutWinners: {},
      createdAt: "",
      updatedAt: "",
    },
    official,
    BRACKET_MATCH_ROUNDS,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-[var(--brand-strong)]">🏆 Cuadro del Mundial</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Predicción de brackets</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ordena los 12 grupos, elige los 8 mejores terceros y completa el cuadro eliminatorio.
          {hasSavedBracket && " Ya tienes un cuadro guardado."}
        </p>
      </div>

      <BracketPredictorClient
        tournamentId={MOCK_TOURNAMENT.id}
        groups={groups}
        existing={existing}
        locked={locked}
        score={score}
      />
    </div>
  );
}
