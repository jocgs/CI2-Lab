"use client";

import { useMemo, useState, useTransition } from "react";
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
import { FantasyPlayerSearchPicker } from "@/components/fantasy/FantasyPlayerSearchPicker";
import { NationalTeamPickerSelect } from "@/components/fantasy/NationalTeamPickerSelect";
import { NationalTeamHeroBanner } from "@/components/fantasy/NationalTeamHeroBanner";
import { FantasyMvpHeroBanner } from "@/components/fantasy/FantasyMvpHeroBanner";
import { PredictionTournamentTeamPicker } from "@/components/fantasy/PredictionTournamentTeamPicker";
import { isFantasyCompetitionLocked } from "@/lib/fantasy-lock";

interface Props {
  fantasyTeam: FantasyTeam;
  allPlayers: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  squadPlayers: FantasyPlayer[];
  tournamentTeams: TournamentTeam[];
  existingPicks: UserTournamentPicks | null;
  competitionId: string;
  tournamentId: string;
  leagueId?: string | null;
  picksLocked: boolean;
  showRevelation?: boolean;
}

export function PredictionsForm({
  fantasyTeam,
  allPlayers,
  nationalTeams,
  squadPlayers,
  tournamentTeams,
  existingPicks,
  competitionId,
  tournamentId,
  leagueId = null,
  picksLocked,
  showRevelation = true,
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
  const competitionLocked = isFantasyCompetitionLocked();
  const isLocked =
    fantasyTeam.locked || picksLocked || competitionLocked || isPending;

  const squadIds = useMemo(
    () => new Set(squadPlayers.map((p) => p.id)),
    [squadPlayers],
  );

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

  const mvpPlayer = mvpPlayerId
    ? squadPlayers.find((p) => p.id === mvpPlayerId) ??
      allPlayers.find((p) => p.id === mvpPlayerId)
    : undefined;

  const allFilled =
    championTeamId &&
    mvpPlayerId &&
    disappointmentId &&
    (showRevelation ? revelationId : true);

  function handleChange(
    setter: (v: string) => void,
    value: string,
  ) {
    setter(value);
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    if (!allFilled) {
      setError(
        showRevelation
          ? "Rellena las cuatro predicciones antes de guardar."
          : "Rellena campeón, MVP y decepción antes de guardar.",
      );
      return;
    }
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await saveAllPredictionsAction({
        competitionId,
        tournamentId,
        leagueId,
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
            {championTeamId && ntMap.get(championTeamId) ? (
              <NationalTeamHeroBanner
                team={ntMap.get(championTeamId)!}
                subtitle={`Campeón · cuota x${(ntMap.get(championTeamId)!.odds ?? 5).toFixed(1)} · hasta +${Math.ceil((ntMap.get(championTeamId)!.odds ?? 5) * 5)} pts`}
                onClear={isLocked ? undefined : () => handleChange(setChampionTeamId, "")}
              />
            ) : (
              <NationalTeamPickerSelect
                name="prediction-champion"
                teams={[...availableChampion].sort((a, b) => (a.odds ?? 99) - (b.odds ?? 99))}
                value={championTeamId}
                onChange={(id) => handleChange(setChampionTeamId, id)}
                placeholder="Selecciona un equipo…"
                disabled={isLocked}
              />
            )}
          </div>

          {/* MVP */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              🌟 MVP del torneo
            </label>
            {mvpPlayer ? (
              <FantasyMvpHeroBanner
                player={mvpPlayer}
                onClear={isLocked ? undefined : () => handleChange(setMvpPlayerId, "")}
              />
            ) : (
              <FantasyPlayerSearchPicker
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={mvpPlayerId || null}
                onChange={(id) => handleChange(setMvpPlayerId, id ?? "")}
                disabled={isLocked}
                restrictToPlayerIds={squadIds}
                hint="El mejor jugador del Mundial — debe ser uno de los 15 de tu plantilla."
                placeholder="Buscar en tu plantilla…"
              />
            )}
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

              <PredictionTournamentTeamPicker
                selectName="prediction-disappointment"
                options={availableDisappointment}
                value={disappointmentId}
                onChange={(id) => handleChange(setDisappointmentId, id)}
                disabled={isLocked}
                placeholder="Elige tu decepción…"
                formatOdds={formatOdds}
              />
            </div>
          </div>

          {showRevelation && (
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

              <PredictionTournamentTeamPicker
                selectName="prediction-revelation"
                options={availableRevelation}
                value={revelationId}
                onChange={(id) => handleChange(setRevelationId, id)}
                disabled={isLocked}
                placeholder="Elige tu tapada…"
                formatOdds={formatOdds}
              />
            </div>
          </div>
          )}
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

      {isLocked && !isPending ? (
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
