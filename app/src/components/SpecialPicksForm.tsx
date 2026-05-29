"use client";

import { useState, useTransition } from "react";
import type { TournamentTeam, UserTournamentPicks } from "@/types/picks";
import {
  getEligibleRevelationTeams,
  validateSpecialPicks,
  formatOdds,
  calculateRevelationPoints,
  stageLabelEs,
  REVELATION_MIN_ODDS,
} from "@/lib/tournament-picks";
import { savePicksAction } from "@/app/picks/picks-actions";
import { NationalTeamCrest } from "@/components/fantasy/NationalTeamCrest";
import { TournamentTeamPickerSelect } from "@/components/fantasy/TournamentTeamPickerSelect";
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
  const [saved, setSaved] = useState(!!existingPicks?.revelationTeamId);
  const [error, setError] = useState<string | null>(null);

  const revelationTeams = getEligibleRevelationTeams(teams);
  const selectedRevelation = teams.find((t) => t.id === revelationId) ?? null;
  const isDirty = revelationId !== (existingPicks?.revelationTeamId ?? "");

  const clientValidation = validateSpecialPicks({
    revelationTeamId: revelationId || null,
    teams,
  });

  function handleSave() {
    setError(null);
    if (!clientValidation.valid) { setError(clientValidation.error); return; }
    startTransition(async () => {
      const result = await savePicksAction({ tournamentId, revelationTeamId: revelationId });
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isLocked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          🔒 El torneo ha comenzado. Tu selección revelación está bloqueada.
        </div>
      )}

      {/* ── Tarjeta Selección Revelación ── */}
      <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-amber-300 dark:border-amber-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 dark:from-amber-950/40 dark:to-yellow-950/30">
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">⭐</span>
            <div>
              <h2 className="text-base font-semibold">Selección revelación</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Tu tapada del torneo — solo válida con cuota ≥ {REVELATION_MIN_ODDS}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Explicación */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="mb-1.5 font-semibold">¿Cómo funciona este modo?</p>
            <p>
              Aquí eliges una selección que <strong>no parte como favorita</strong>, pero que crees que puede
              sorprender en el torneo. Solo aparecen equipos con cuota alta, por lo que no podrás elegir grandes
              favoritos. Si tu selección llega más lejos de lo esperado, sumarás puntos extra.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4">
              <li>No es lo mismo que elegir campeón.</li>
              <li>Solo puedes elegir <strong>una</strong> selección revelación.</li>
              <li>Solo aparecen selecciones con <strong>cuota ≥ {REVELATION_MIN_ODDS}</strong>.</li>
              <li>No puede coincidir con tu elección de campeón ni de decepción.</li>
              <li>Predicción especial pensada para premiar apuestas arriesgadas pero razonables.</li>
            </ul>
          </div>

          {/* Selector */}
          <TeamSelector
            options={revelationTeams}
            value={revelationId}
            onChange={(id) => { setRevelationId(id); setSaved(false); setError(null); }}
            disabled={isLocked}
            placeholder="Elige tu tapada…"
          />

          {selectedRevelation && (
            <SelectedBadge team={selectedRevelation} />
          )}

          {/* Tabla de puntuación */}
          <details className="group">
            <summary className="flex cursor-pointer select-none list-none items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
              ¿Cómo se puntúa?
            </summary>
            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-xs">
                <tbody>
                  {(["round_of_16", "quarter_finals", "semi_finals", "final", "winner"] as const).map((stage) => {
                    const pts = calculateRevelationPoints(stage);
                    return (
                      <tr key={stage} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-3 py-1.5 text-[var(--muted)]">{stageLabelEs(stage)}</td>
                        <td className={clsx(
                          "px-3 py-1.5 text-right font-semibold tabular-nums",
                          pts > 0 ? "text-green-600 dark:text-green-400" : "text-[var(--muted)]",
                        )}>
                          {pts > 0 ? `+${pts}` : pts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>

      {/* ── Error / Guardar ── */}
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
            className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Guardando…" : "Guardar selección revelación"}
          </button>
          {saved && !isDirty && !error && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <span className="text-base">✓</span> Selección guardada
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TeamSelector({
  options,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  options: TournamentTeam[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <TournamentTeamPickerSelect
        name="special-pick-team"
        teams={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {options.map((team) => {
          const isSelected = team.id === value;
          return (
            <button
              key={team.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(team.id === value ? "" : team.id)}
              title={`${team.name} — cuota ${formatOdds(team.marketOdds)}`}
              className={clsx(
                "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-xs transition-all",
                isSelected
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold text-[var(--brand-strong)]"
                  : "cursor-pointer border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <NationalTeamCrest
                team={{ id: team.id, name: team.name, logoUrl: team.crestUrl }}
                size={28}
              />
              <span className="w-full truncate text-center text-[10px] leading-tight">
                {team.name.split(" ")[0]}
              </span>
              <span className="text-[9px] tabular-nums text-[var(--muted)]">
                {formatOdds(team.marketOdds)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedBadge({ team }: { team: TournamentTeam }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
      <NationalTeamCrest
        team={{ id: team.id, name: team.name, logoUrl: team.crestUrl }}
        size={28}
      />
      <div>
        <p className="font-semibold">{team.name}</p>
        <p className="text-xs opacity-75">Cuota: {formatOdds(team.marketOdds)}</p>
      </div>
    </div>
  );
}
