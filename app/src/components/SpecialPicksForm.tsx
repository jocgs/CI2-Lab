"use client";

import { useState, useTransition } from "react";
import type { TournamentTeam, UserTournamentPicks } from "@/types/picks";
import {
  getEligibleRevelationTeams,
  getEligibleDisappointmentTeams,
  validateSpecialPicks,
  formatOdds,
  calculateRevelationPoints,
  calculateDisappointmentPoints,
  stageLabelEs,
  REVELATION_MIN_ODDS,
  DISAPPOINTMENT_MAX_ODDS,
} from "@/lib/tournament-picks";
import { savePicksAction } from "@/app/picks/picks-actions";
import { clsx } from "@/lib/utils";

interface Props {
  teams: TournamentTeam[];
  existingPicks: UserTournamentPicks | null;
  tournamentId: string;
  isLocked: boolean;
}

export function SpecialPicksForm({ teams, existingPicks, tournamentId, isLocked }: Props) {
  const [isPending, startTransition] = useTransition();
  const [revelationId, setRevelationId] = useState(existingPicks?.revelationTeamId ?? "");
  const [disappointmentId, setDisappointmentId] = useState(
    existingPicks?.disappointmentTeamId ?? "",
  );
  const [saved, setSaved] = useState(!!existingPicks);
  const [error, setError] = useState<string | null>(null);

  const revelationTeams = getEligibleRevelationTeams(teams);
  const disappointmentTeams = getEligibleDisappointmentTeams(teams);

  const selectedRevelation = teams.find((t) => t.id === revelationId) ?? null;
  const selectedDisappointment = teams.find((t) => t.id === disappointmentId) ?? null;

  const isDirty =
    revelationId !== (existingPicks?.revelationTeamId ?? "") ||
    disappointmentId !== (existingPicks?.disappointmentTeamId ?? "");

  const clientValidation = validateSpecialPicks({
    revelationTeamId: revelationId || null,
    disappointmentTeamId: disappointmentId || null,
    teams,
  });

  function handleSave() {
    setError(null);
    if (!clientValidation.valid) {
      setError(clientValidation.error);
      return;
    }
    startTransition(async () => {
      const result = await savePicksAction({
        tournamentId,
        revelationTeamId: revelationId,
        disappointmentTeamId: disappointmentId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header banner when locked ── */}
      {isLocked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          🔒 El torneo ha comenzado. Tus selecciones están bloqueadas.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ────────────────── REVELATION ────────────────── */}
        <PickCard
          icon="⭐"
          title="Selección revelación"
          subtitle={`Tu tapada del torneo. Solo válidas con cuota ≥ ${REVELATION_MIN_ODDS}.`}
          accentClass="border-amber-300 dark:border-amber-700"
          headerClass="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30"
          scoringRows={[
            { stage: "round_of_16",    pts: calculateRevelationPoints("round_of_16") },
            { stage: "quarter_finals", pts: calculateRevelationPoints("quarter_finals") },
            { stage: "semi_finals",    pts: calculateRevelationPoints("semi_finals") },
            { stage: "final",          pts: calculateRevelationPoints("final") },
            { stage: "winner",         pts: calculateRevelationPoints("winner") },
          ]}
        >
          <TeamSelector
            options={revelationTeams}
            value={revelationId}
            onChange={(id) => { setRevelationId(id); setSaved(false); setError(null); }}
            disabled={isLocked}
            placeholder="Elige tu tapada…"
            highlightId={disappointmentId}
            highlightReason="Ya elegida como decepción"
          />
          {selectedRevelation && (
            <SelectedBadge team={selectedRevelation} colorClass="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" />
          )}
        </PickCard>

        {/* ────────────────── DISAPPOINTMENT ────────────────── */}
        <PickCard
          icon="💣"
          title="Selección decepción"
          subtitle={`La favorita que crees que se la pega. Solo válidas con cuota ≤ ${DISAPPOINTMENT_MAX_ODDS}.`}
          accentClass="border-rose-300 dark:border-rose-700"
          headerClass="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30"
          scoringRows={[
            { stage: "group_stage",    pts: calculateDisappointmentPoints("group_stage") },
            { stage: "round_of_16",    pts: calculateDisappointmentPoints("round_of_16") },
            { stage: "quarter_finals", pts: calculateDisappointmentPoints("quarter_finals") },
            { stage: "final",          pts: calculateDisappointmentPoints("final") },
            { stage: "winner",         pts: calculateDisappointmentPoints("winner") },
          ]}
        >
          <TeamSelector
            options={disappointmentTeams}
            value={disappointmentId}
            onChange={(id) => { setDisappointmentId(id); setSaved(false); setError(null); }}
            disabled={isLocked}
            placeholder="Elige tu decepción…"
            highlightId={revelationId}
            highlightReason="Ya elegida como revelación"
          />
          {selectedDisappointment && (
            <SelectedBadge team={selectedDisappointment} colorClass="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" />
          )}
        </PickCard>
      </div>

      {/* ── Error / save ── */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {!isLocked && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isPending || !isDirty || !clientValidation.valid}
            className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isPending ? "Guardando…" : "Guardar selecciones"}
          </button>

          {saved && !isDirty && !error && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <span className="text-base">✓</span> Selecciones guardadas
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PickCard({
  icon,
  title,
  subtitle,
  accentClass,
  headerClass,
  scoringRows,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accentClass: string;
  headerClass: string;
  scoringRows: { stage: Parameters<typeof stageLabelEs>[0]; pts: number }[];
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("flex flex-col rounded-2xl border-2 overflow-hidden", accentClass)}>
      {/* Card header */}
      <div className={clsx("px-5 py-4", headerClass)}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="font-semibold text-base">{title}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Selector area */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        {children}

        {/* Scoring table */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--fg)] select-none list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            ¿Cómo se puntúa?
          </summary>
          <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {scoringRows.map(({ stage, pts }) => (
                  <tr key={stage} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-1.5 text-[var(--muted)]">{stageLabelEs(stage)}</td>
                    <td className={clsx(
                      "px-3 py-1.5 text-right font-semibold tabular-nums",
                      pts > 0 ? "text-green-600 dark:text-green-400"
                        : pts < 0 ? "text-red-500"
                        : "text-[var(--muted)]",
                    )}>
                      {pts > 0 ? `+${pts}` : pts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}

function TeamSelector({
  options,
  value,
  onChange,
  disabled,
  placeholder,
  highlightId,
  highlightReason,
}: {
  options: TournamentTeam[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
  placeholder: string;
  highlightId: string;
  highlightReason: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((team) => {
          const isConflict = team.id === highlightId;
          return (
            <option key={team.id} value={team.id} disabled={isConflict}>
              {team.flag} {team.name} — cuota {formatOdds(team.marketOdds)}
              {isConflict ? ` (${highlightReason})` : ""}
            </option>
          );
        })}
      </select>

      {/* Team grid for visual picking */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {options.map((team) => {
          const isSelected = team.id === value;
          const isConflict = team.id === highlightId;
          return (
            <button
              key={team.id}
              type="button"
              disabled={disabled || isConflict}
              onClick={() => !isConflict && onChange(team.id === value ? "" : team.id)}
              title={isConflict ? highlightReason : `${team.name} — cuota ${formatOdds(team.marketOdds)}`}
              className={clsx(
                "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-xs transition-all",
                isSelected
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold text-[var(--brand-strong)]"
                  : isConflict
                  ? "border-dashed border-[var(--border)] opacity-30 cursor-not-allowed"
                  : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] cursor-pointer",
                disabled && "cursor-not-allowed",
              )}
            >
              <span className="text-lg leading-none">{team.flag}</span>
              <span className="truncate w-full text-center text-[10px] leading-tight">
                {team.name.split(" ")[0]}
              </span>
              <span className="text-[9px] text-[var(--muted)] tabular-nums">
                {formatOdds(team.marketOdds)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedBadge({
  team,
  colorClass,
}: {
  team: TournamentTeam;
  colorClass: string;
}) {
  return (
    <div className={clsx("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium", colorClass)}>
      <span className="text-xl">{team.flag}</span>
      <div>
        <p className="font-semibold">{team.name}</p>
        <p className="text-xs opacity-75">Cuota: {formatOdds(team.marketOdds)}</p>
      </div>
    </div>
  );
}
