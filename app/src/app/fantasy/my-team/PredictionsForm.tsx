"use client";

import { useState, useTransition } from "react";
import type { FantasyNationalTeam, FantasyPlayer, FantasyTeam } from "@/types/fantasy";
import type { TournamentTeam, UserTournamentPicks } from "@/types/picks";
import { saveAllPredictionsAction } from "./prediction-actions";
import {
  getEligibleRevelationTeams,
  getEligibleDisappointmentTeams,
  formatOdds,
  calculateRevelationPoints,
  calculateDisappointmentPoints,
  stageLabelEs,
  REVELATION_MIN_ODDS,
  DISAPPOINTMENT_MAX_ODDS,
} from "@/lib/tournament-picks";

interface Props {
  fantasyTeam: FantasyTeam;
  nationalTeams: FantasyNationalTeam[];
  squadPlayers: FantasyPlayer[];
  tournamentTeams: TournamentTeam[];
  existingPicks: UserTournamentPicks | null;
  competitionId: string;
  tournamentId: string;
  picksLocked: boolean;
}

export function PredictionsForm({
  fantasyTeam,
  nationalTeams,
  squadPlayers,
  tournamentTeams,
  existingPicks,
  competitionId,
  tournamentId,
  picksLocked,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [championTeamId,    setChampionTeamId]    = useState(fantasyTeam.championTeamId       ?? "");
  const [mvpPlayerId,       setMvpPlayerId]        = useState(fantasyTeam.tournamentMvpPlayerId ?? "");
  const [disappointmentId,  setDisappointmentId]  = useState(fantasyTeam.disappointmentTeamId ?? "");
  const [revelationId,      setRevelationId]       = useState(existingPicks?.revelationTeamId  ?? "");

  // ── Derived ───────────────────────────────────────────────────────────────
  const isLocked = fantasyTeam.locked || picksLocked || isPending;

  const revelationTeams     = getEligibleRevelationTeams(tournamentTeams);
  const disappointmentTeams = getEligibleDisappointmentTeams(tournamentTeams);

  const ntMap  = new Map(nationalTeams.map((t) => [t.id, t]));
  const ttMap  = new Map(tournamentTeams.map((t) => [t.id, t]));

  // champion cannot equal disappointment or revelation
  const championConflict  = (id: string) =>
    id !== "" && (id === disappointmentId || id === revelationId);
  const availableChampion = nationalTeams.filter(
    (t) => t.id === championTeamId || (t.id !== disappointmentId && t.id !== revelationId),
  );
  const availableDisappointment = disappointmentTeams.filter(
    (t) => t.id === disappointmentId || (t.id !== championTeamId && t.id !== revelationId),
  );
  const availableRevelation = revelationTeams.filter(
    (t) => t.id === revelationId || (t.id !== championTeamId && t.id !== disappointmentId),
  );

  const allFilled = championTeamId && mvpPlayerId && disappointmentId && revelationId;

  function handleChange(
    setter: (v: string) => void,
    value: string,
  ) {
    setter(value);
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    if (!allFilled) { setError("Rellena las cuatro predicciones antes de guardar."); return; }
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await saveAllPredictionsAction({
        competitionId,
        tournamentId,
        championTeamId,
        tournamentMvpPlayerId: mvpPlayerId,
        disappointmentTeamId: disappointmentId,
        revelationTeamId: revelationId,
      });
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ══════════════════════════════════════════════════
          BLOQUE 1 — Predicciones principales
      ══════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="font-semibold">🎯 Predicciones principales</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Elige el campeón del torneo y el MVP de tu plantilla.</p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* Campeón */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              🏆 Campeón del torneo
            </label>
            <p className="mb-2 text-xs text-[var(--muted)]">La selección que levantará el trofeo. La cuota determina tus puntos bonus si aciertas.</p>
            <select
              value={championTeamId}
              onChange={(e) => handleChange(setChampionTeamId, e.target.value)}
              disabled={isLocked}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            >
              <option value="">Selecciona un equipo…</option>
              {availableChampion
                .slice().sort((a, b) => (a.odds ?? 99) - (b.odds ?? 99))
                .map((t) => {
                  const conflict = championConflict(t.id) && t.id !== championTeamId;
                  return (
                    <option key={t.id} value={t.id} disabled={conflict}>
                      {t.flagUrl} {t.name}
                      {t.odds !== undefined ? `  — x${t.odds.toFixed(1)}` : ""}
                      {conflict ? " (ya elegida)" : ""}
                    </option>
                  );
                })}
            </select>
            {championTeamId && ntMap.get(championTeamId) && (
              <SelectedNtBadge team={ntMap.get(championTeamId)!} bonus={Math.ceil((ntMap.get(championTeamId)!.odds ?? 5) * 5)} label="Campeón" />
            )}
          </div>

          {/* MVP */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              🌟 MVP del torneo
            </label>
            <p className="mb-2 text-xs text-[var(--muted)]">El mejor jugador del Mundial — solo puedes elegir uno de tu plantilla.</p>
            <select
              value={mvpPlayerId}
              onChange={(e) => handleChange(setMvpPlayerId, e.target.value)}
              disabled={isLocked}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            >
              <option value="">Selecciona un jugador…</option>
              {squadPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.nationalTeamName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BLOQUE 2 — Predicciones especiales con cuotas
      ══════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="font-semibold">⚡ Predicciones especiales con cuotas</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Apuestas de alto riesgo: una selección que crees que fallará y una tapada que sorprenderá.
          </p>
        </div>

        <div className="flex flex-col gap-6 p-5">

          {/* ── Decepción ── */}
          <div className="rounded-2xl border-2 border-rose-200 overflow-hidden dark:border-rose-800">
            <div className="bg-gradient-to-r from-rose-50 to-red-50 px-5 py-3 dark:from-rose-950/40 dark:to-red-950/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💣</span>
                <div>
                  <p className="font-semibold text-sm">Selección decepción</p>
                  <p className="text-xs text-[var(--muted)]">Solo favoritas — cuota ≤ {DISAPPOINTMENT_MAX_ODDS}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-xs text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                <p>
                  Aquí eliges una selección favorita o candidata fuerte que crees que se la pegará antes de lo esperado.
                  <strong> Cuanto más favorita sea y peor lo haga, más puntos podrás sumar.</strong>
                </p>
                <ScoringTable
                  rows={[
                    { stage: "group_stage",    pts: calculateDisappointmentPoints("group_stage")    },
                    { stage: "round_of_16",    pts: calculateDisappointmentPoints("round_of_16")    },
                    { stage: "quarter_finals", pts: calculateDisappointmentPoints("quarter_finals") },
                    { stage: "semi_finals",    pts: calculateDisappointmentPoints("semi_finals")    },
                    { stage: "final",          pts: calculateDisappointmentPoints("final")          },
                    { stage: "winner",         pts: calculateDisappointmentPoints("winner")         },
                  ]}
                />
              </div>

              <TournamentTeamPicker
                options={availableDisappointment}
                value={disappointmentId}
                onChange={(id) => handleChange(setDisappointmentId, id)}
                disabled={isLocked}
                placeholder="Elige tu decepción…"
              />
              {disappointmentId && ttMap.get(disappointmentId) && (
                <SelectedTtBadge
                  team={ttMap.get(disappointmentId)!}
                  colorClass="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                />
              )}
            </div>
          </div>

          {/* ── Revelación ── */}
          <div className="rounded-2xl border-2 border-amber-300 overflow-hidden dark:border-amber-700">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 dark:from-amber-950/40 dark:to-yellow-950/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-semibold text-sm">Selección revelación / tapada</p>
                  <p className="text-xs text-[var(--muted)]">Solo tapadas — cuota ≥ {REVELATION_MIN_ODDS}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="mb-1.5 font-semibold">¿Cómo funciona este modo?</p>
                <p>
                  Elige una selección que <strong>no parte como favorita</strong> pero que crees que puede sorprender.
                  Solo aparecen equipos con cuota alta — los grandes favoritos no son elegibles.
                  Si tu selección llega más lejos de lo esperado, sumarás puntos extra.
                </p>
                <ul className="mt-2 list-disc space-y-0.5 pl-4">
                  <li>No es lo mismo que elegir campeón.</li>
                  <li>Solo puedes elegir <strong>una</strong> selección revelación.</li>
                  <li>Solo aparecen selecciones con <strong>cuota ≥ {REVELATION_MIN_ODDS}</strong>.</li>
                  <li>No puede coincidir con tu campeón ni con tu decepción.</li>
                </ul>
                <ScoringTable
                  rows={[
                    { stage: "round_of_16",    pts: calculateRevelationPoints("round_of_16")    },
                    { stage: "quarter_finals", pts: calculateRevelationPoints("quarter_finals") },
                    { stage: "semi_finals",    pts: calculateRevelationPoints("semi_finals")    },
                    { stage: "final",          pts: calculateRevelationPoints("final")          },
                    { stage: "winner",         pts: calculateRevelationPoints("winner")         },
                  ]}
                />
              </div>

              <TournamentTeamPicker
                options={availableRevelation}
                value={revelationId}
                onChange={(id) => handleChange(setRevelationId, id)}
                disabled={isLocked}
                placeholder="Elige tu tapada…"
              />
              {revelationId && ttMap.get(revelationId) && (
                <SelectedTtBadge
                  team={ttMap.get(revelationId)!}
                  colorClass="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          Botón guardar
      ══════════════════════════════════════════════════ */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
          <span>✓</span> Todas las predicciones guardadas
        </p>
      )}

      {fantasyTeam.locked || picksLocked ? (
        <p className="text-xs text-[var(--muted)]">
          🔒 Las predicciones están bloqueadas y ya no pueden modificarse.
        </p>
      ) : (
        <button
          onClick={handleSave}
          disabled={isPending || !allFilled}
          className="w-full rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
        >
          {isPending ? "Guardando…" : "Guardar predicciones"}
        </button>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TournamentTeamPicker({
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.flag} {t.name} — cuota {formatOdds(t.marketOdds)}
          </option>
        ))}
      </select>

      {/* Visual grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {options.map((t) => {
          const isSelected = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(t.id === value ? "" : t.id)}
              title={`${t.name} — cuota ${formatOdds(t.marketOdds)}`}
              className={[
                "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-xs transition-all",
                isSelected
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold text-[var(--brand-strong)]"
                  : "cursor-pointer border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]",
                disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              <span className="text-lg leading-none">{t.flag}</span>
              <span className="w-full truncate text-center text-[10px] leading-tight">
                {t.name.split(" ")[0]}
              </span>
              <span className="text-[9px] tabular-nums text-[var(--muted)]">
                {formatOdds(t.marketOdds)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedNtBadge({ team, bonus, label }: { team: FantasyNationalTeam; bonus: number; label: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/30 px-3 py-2 text-sm">
      <span className="text-xl">{team.flagUrl}</span>
      <div className="flex-1">
        <p className="font-semibold">{team.name}</p>
        {team.odds && <p className="text-xs text-[var(--muted)]">Cuota x{team.odds.toFixed(1)}</p>}
      </div>
      <span className="rounded-full bg-[var(--brand)] px-2.5 py-0.5 text-xs font-bold text-white">
        +{bonus} pts
      </span>
    </div>
  );
}

function SelectedTtBadge({ team, colorClass }: { team: TournamentTeam; colorClass: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${colorClass}`}>
      <span className="text-xl">{team.flag}</span>
      <div>
        <p className="font-semibold">{team.name}</p>
        <p className="text-xs opacity-75">Cuota: {formatOdds(team.marketOdds)}</p>
      </div>
    </div>
  );
}

function ScoringTable({
  rows,
}: {
  rows: { stage: Parameters<typeof stageLabelEs>[0]; pts: number }[];
}) {
  return (
    <details className="group mt-2">
      <summary className="flex cursor-pointer select-none list-none items-center gap-1 font-normal hover:underline">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        ¿Cómo se puntúa?
      </summary>
      <div className="mt-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-[10px]">
          <tbody>
            {rows.map(({ stage, pts }) => (
              <tr key={stage} className="border-b border-[var(--border)] last:border-0">
                <td className="px-2 py-1 text-[var(--muted)]">{stageLabelEs(stage)}</td>
                <td className={[
                  "px-2 py-1 text-right font-semibold tabular-nums",
                  pts > 0 ? "text-green-600 dark:text-green-400"
                  : pts < 0 ? "text-red-500"
                  : "text-[var(--muted)]",
                ].join(" ")}>
                  {pts > 0 ? `+${pts}` : pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
