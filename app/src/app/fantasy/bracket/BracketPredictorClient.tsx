"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type {
  GroupStandings,
  KnockoutWinners,
  UserWorldCupBracketPrediction,
} from "@/types/bracket-prediction";
import type { BracketScoreEvaluation } from "@/lib/world-cup-bracket-scoring";
import { GroupRankingGrid } from "@/components/fantasy/bracket/GroupRankingPanel";
import { ThirdPlacePicker } from "@/components/fantasy/bracket/ThirdPlacePicker";
import { KnockoutRoundSection } from "@/components/fantasy/bracket/KnockoutMatchCard";
import {
  BracketPodiumSummary,
  BracketScorePanel,
  BracketTreeVisualization,
} from "@/components/fantasy/bracket/BracketVisualization";
import {
  areGroupStandingsComplete,
  areThirdPlacePicksComplete,
  BRACKET_ROUNDS_ORDER,
  isBracketComplete,
  isKnockoutReady,
  pruneInvalidWinners,
  resolveBracketMatches,
} from "@/lib/world-cup-bracket";
import type { BracketTeamInfo } from "@/types/bracket-prediction";
import { saveWorldCupBracketAction } from "./bracket-actions";
import { clsx } from "@/lib/utils";

type Step = "groups" | "thirds" | "knockout" | "view";

interface Props {
  tournamentId: string;
  groups: Record<string, BracketTeamInfo[]>;
  existing: UserWorldCupBracketPrediction | null;
  locked: boolean;
  score: BracketScoreEvaluation;
}

export function BracketPredictorClient({
  tournamentId,
  groups,
  existing,
  locked,
  score,
}: Props) {
  const initialInput = {
    groupStandings: existing?.groupStandings ?? {},
    qualifyingThirdGroups: existing?.qualifyingThirdGroups ?? [],
    knockoutWinners: existing?.knockoutWinners ?? {},
  };

  const [step, setStep] = useState<Step>(() => {
    const input = {
      groupStandings: initialInput.groupStandings,
      qualifyingThirdGroups: initialInput.qualifyingThirdGroups,
      knockoutWinners: initialInput.knockoutWinners,
    };
    if (existing && isBracketComplete(input)) return "view";
    if (existing && isKnockoutReady(input)) return "knockout";
    if (existing && areGroupStandingsComplete(initialInput.groupStandings)) return "thirds";
    return "groups";
  });

  const [standings, setStandings] = useState<GroupStandings>(initialInput.groupStandings);
  const [qualifyingThirdGroups, setQualifyingThirdGroups] = useState<string[]>(
    initialInput.qualifyingThirdGroups,
  );
  const [winners, setWinners] = useState<KnockoutWinners>(initialInput.knockoutWinners);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const bracketInput = useMemo(
    () => ({ groupStandings: standings, qualifyingThirdGroups, knockoutWinners: winners }),
    [standings, qualifyingThirdGroups, winners],
  );

  const groupsComplete = areGroupStandingsComplete(standings);
  const thirdsComplete = areThirdPlacePicksComplete(qualifyingThirdGroups);
  const knockoutReady = isKnockoutReady(bracketInput);
  const resolvedMatches = useMemo(() => resolveBracketMatches(bracketInput), [bracketInput]);
  const bracketComplete = isBracketComplete(bracketInput);

  function handleStandingsChange(next: GroupStandings) {
    setStandings(next);
    setWinners((prev) =>
      pruneInvalidWinners({ groupStandings: next, qualifyingThirdGroups, knockoutWinners: prev }),
    );
    setSaved(false);
  }

  function handleThirdGroupsChange(next: string[]) {
    setQualifyingThirdGroups(next);
    setWinners((prev) =>
      pruneInvalidWinners({ groupStandings: standings, qualifyingThirdGroups: next, knockoutWinners: prev }),
    );
    setSaved(false);
  }

  function handlePickWinner(matchId: string, teamId: string) {
    if (locked) return;
    setWinners((prev) => {
      const next = { ...prev, [matchId]: teamId };
      return pruneInvalidWinners({
        groupStandings: standings,
        qualifyingThirdGroups,
        knockoutWinners: next,
      });
    });
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveWorldCupBracketAction({
        tournamentId,
        groupStandings: standings,
        qualifyingThirdGroups,
        knockoutWinners: winners,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setStep("view");
    });
  }

  const steps: { id: Step; label: string; enabled: boolean }[] = [
    { id: "groups", label: "1. Grupos", enabled: true },
    { id: "thirds", label: "2. Mejores 3º", enabled: groupsComplete },
    { id: "knockout", label: "3. Eliminatorias", enabled: knockoutReady },
    { id: "view", label: "4. Mi cuadro", enabled: groupsComplete },
  ];

  return (
    <div className="flex flex-col gap-6">
      <BracketScorePanel score={score} />

      <nav className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!s.enabled}
            onClick={() => s.enabled && setStep(s.id)}
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              step === s.id
                ? "bg-[var(--brand)] text-white"
                : s.enabled
                  ? "border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]"
                  : "cursor-not-allowed border border-[var(--border)] bg-[var(--surface)] opacity-40",
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {locked && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          El torneo ya ha empezado. Tu cuadro está bloqueado.
        </p>
      )}

      {step === "groups" && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Clasificación de grupos</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Ordena las 4 selecciones de cada grupo pulsando los escudos en orden.
            </p>
          </div>
          <GroupRankingGrid
            groups={groups}
            standings={standings}
            onStandingsChange={handleStandingsChange}
            disabled={locked}
          />
          {groupsComplete && (
            <button
              type="button"
              onClick={() => setStep("thirds")}
              className="self-start rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Elegir mejores terceros →
            </button>
          )}
        </section>
      )}

      {step === "thirds" && (
        <section className="flex flex-col gap-4">
          {!groupsComplete ? (
            <p className="text-sm text-amber-700">Primero completa todos los grupos.</p>
          ) : (
            <>
              <ThirdPlacePicker
                standings={standings}
                selectedGroups={qualifyingThirdGroups}
                onChange={handleThirdGroupsChange}
                disabled={locked}
              />
              {thirdsComplete && (
                <button
                  type="button"
                  onClick={() => setStep("knockout")}
                  className="self-start rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Continuar a eliminatorias →
                </button>
              )}
            </>
          )}
        </section>
      )}

      {step === "knockout" && (
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold">Eliminatorias</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Pulsa el escudo del equipo que crees que pasará de ronda en cada cruce.
            </p>
          </div>

          {!knockoutReady && (
            <p className="text-sm text-amber-700">
              Completa grupos y mejores terceros primero.
            </p>
          )}

          {BRACKET_ROUNDS_ORDER.map((round) => (
            <KnockoutRoundSection
              key={round}
              round={round}
              matches={resolvedMatches}
              winners={winners}
              onPickWinner={handlePickWinner}
              disabled={locked || !knockoutReady}
            />
          ))}

          {bracketComplete && !locked && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={handleSave}
                className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Guardando…" : "Guardar cuadro completo"}
              </button>
              <button
                type="button"
                onClick={() => setStep("view")}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--background)]"
              >
                Vista previa
              </button>
            </div>
          )}
        </section>
      )}

      {step === "view" && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Tu cuadro del Mundial</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Cruces desde dieciseisavos hasta la final con tus ganadores elegidos.
              </p>
            </div>
            {!locked && (
              <button
                type="button"
                onClick={() => setStep("knockout")}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--background)]"
              >
                Editar predicciones
              </button>
            )}
          </div>

          <BracketPodiumSummary matches={resolvedMatches} />
          <BracketTreeVisualization matches={resolvedMatches} />

          {bracketComplete && !locked && !saved && (
            <button
              type="button"
              disabled={pending}
              onClick={handleSave}
              className="self-start rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Guardar cuadro"}
            </button>
          )}
          {saved && (
            <p className="text-sm font-medium text-emerald-600">Cuadro guardado correctamente.</p>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="border-t border-[var(--border)] pt-4">
        <Link href="/fantasy" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
          ← Volver a Fantasy
        </Link>
      </div>
    </div>
  );
}
