"use client";

import React, { useState, useActionState } from "react";
import { placeBetAction } from "@/app/matches/[id]/actions";
import type { Outcome } from "@/types/domain";

const OUTCOME_LABELS: { value: Outcome; label: string; helper: string }[] = [
  { value: "1", label: "1", helper: "Local" },
  { value: "X", label: "X", helper: "Empate" },
  { value: "2", label: "2", helper: "Visitante" },
];

function outcomeFromGoals(home: number, away: number): Outcome {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

/** Marcador mínimo compatible con una quiniela dada. */
function defaultScoreForOutcome(o: Outcome): { home: string; away: string } {
  if (o === "1") return { home: "1", away: "0" };
  if (o === "2") return { home: "0", away: "1" };
  return { home: "0", away: "0" };
}

export default function BetForm({
  matchId,
  defaultHomeGoals,
  defaultAwayGoals,
  defaultOutcome,
}: {
  matchId: string;
  defaultHomeGoals?: number | null;
  defaultAwayGoals?: number | null;
  defaultOutcome?: Outcome | null;
}) {
  const [homeGoals, setHomeGoals] = useState<string>(
    defaultHomeGoals !== undefined && defaultHomeGoals !== null ? String(defaultHomeGoals) : ""
  );
  const [awayGoals, setAwayGoals] = useState<string>(
    defaultAwayGoals !== undefined && defaultAwayGoals !== null ? String(defaultAwayGoals) : ""
  );
  const [outcome, setOutcome] = useState<Outcome | "">(defaultOutcome ?? "");

  const [state, formAction, pending] = useActionState(placeBetAction, null);

  // Marcador → quiniela automática
  const syncOutcomeFromGoals = (nextHome: string, nextAway: string) => {
    const h = nextHome === "" ? null : Number(nextHome);
    const a = nextAway === "" ? null : Number(nextAway);
    if (h === null || a === null || Number.isNaN(h) || Number.isNaN(a)) return;
    setOutcome(outcomeFromGoals(h, a));
  };

  const handleHomeGoalsChange = (val: string) => {
    setHomeGoals(val);
    syncOutcomeFromGoals(val, awayGoals);
  };

  const handleAwayGoalsChange = (val: string) => {
    setAwayGoals(val);
    syncOutcomeFromGoals(homeGoals, val);
  };

  // Quiniela → ajusta marcador si hay conflicto
  const handleOutcomeChange = (next: Outcome) => {
    setOutcome(next);
    const h = homeGoals === "" ? null : Number(homeGoals);
    const a = awayGoals === "" ? null : Number(awayGoals);
    if (
      h !== null && a !== null &&
      !Number.isNaN(h) && !Number.isNaN(a) &&
      outcomeFromGoals(h, a) === next
    ) return;
    const { home, away } = defaultScoreForOutcome(next);
    setHomeGoals(home);
    setAwayGoals(away);
  };

  const outcomeLabel =
    outcome === "1" ? "Victoria local" : outcome === "2" ? "Victoria visitante" : outcome === "X" ? "Empate" : "";

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="outcome" value={outcome} />
      <input type="hidden" name="homeGoals" value={homeGoals} />
      <input type="hidden" name="awayGoals" value={awayGoals} />

      {/* Quiniela */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Quiniela</p>
        <div className="grid grid-cols-3 gap-3">
          {OUTCOME_LABELS.map(({ value, label, helper }) => {
            const isSelected = outcome === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleOutcomeChange(value)}
                className={
                  "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-4 py-4 text-base font-semibold transition-all " +
                  (isSelected
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40")
                }
              >
                <span className="text-2xl">{label}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {helper}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marcador exacto */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Marcador exacto</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-[var(--muted)]">Goles local</span>
            <input
              type="number"
              min="0"
              step="1"
              value={homeGoals}
              onChange={(e) => handleHomeGoalsChange(e.target.value)}
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-base font-semibold outline-none focus:border-[var(--brand)]"
            />
          </label>
          <span className="pb-2 text-lg font-semibold text-[var(--muted)]">-</span>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-[var(--muted)]">Goles visitante</span>
            <input
              type="number"
              min="0"
              step="1"
              value={awayGoals}
              onChange={(e) => handleAwayGoalsChange(e.target.value)}
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-base font-semibold outline-none focus:border-[var(--brand)]"
            />
          </label>
        </div>

        {/* Indicador de coherencia */}
        {homeGoals !== "" && awayGoals !== "" && outcomeLabel && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Marcador{" "}
            <strong className="text-[var(--brand-strong)]">{homeGoals}-{awayGoals}</strong>{" "}
            → <strong className="text-[var(--brand-strong)]">{outcomeLabel}</strong>
          </p>
        )}
      </div>

      {/* Banner de éxito */}
      {state?.ok === true && (
        <div className="flex flex-col gap-1 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="font-semibold">
            ✓ Porra guardada: <strong>{state.homeGoals}-{state.awayGoals}</strong>{" "}
            ({state.outcome === "1" ? "Victoria local" : state.outcome === "2" ? "Victoria visitante" : "Empate"})
          </span>
          <span className="text-xs text-green-700">Puedes cambiarla hasta el inicio del partido.</span>
        </div>
      )}

      {/* Banner de error */}
      {state?.ok === false && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <span>✕ {state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar porra"}
      </button>
    </form>
  );
}
