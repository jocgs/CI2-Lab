"use client";

import React, { useState } from "react";
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

  const syncOutcomeFromGoals = (nextHomeGoals: string, nextAwayGoals: string) => {
    const h = nextHomeGoals === "" ? null : Number(nextHomeGoals);
    const a = nextAwayGoals === "" ? null : Number(nextAwayGoals);
    if (h === null || a === null || Number.isNaN(h) || Number.isNaN(a)) return;
    setOutcome(outcomeFromGoals(h, a));
  };

  const handleHomeGoalsChange = (nextHomeGoals: string) => {
    setHomeGoals(nextHomeGoals);
    syncOutcomeFromGoals(nextHomeGoals, awayGoals);
  };

  const handleAwayGoalsChange = (nextAwayGoals: string) => {
    setAwayGoals(nextAwayGoals);
    syncOutcomeFromGoals(homeGoals, nextAwayGoals);
  };

  return (
    <form action={placeBetAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Quiniela</p>
        <div className="grid grid-cols-3 gap-3">
          {OUTCOME_LABELS.map(({ value, label, helper }) => {
            const isSelected = outcome === value;
            return (
              <label
                key={value}
                className={
                  "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-4 py-4 text-base font-semibold transition-all " +
                  (isSelected
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40")
                }
              >
                <input
                  type="radio"
                  name="outcome"
                  value={value}
                  checked={isSelected}
                  onChange={() => setOutcome(value)}
                  required
                  className="sr-only"
                />
                <span className="text-2xl">{label}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {helper}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Marcador exacto</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-xs text-[var(--muted)]">Goles local</span>
            <input
              type="number"
              name="homeGoals"
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
              name="awayGoals"
              min="0"
              step="1"
              value={awayGoals}
              onChange={(e) => handleAwayGoalsChange(e.target.value)}
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-base font-semibold outline-none focus:border-[var(--brand)]"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]"
      >
        Guardar porra
      </button>
    </form>
  );
}
