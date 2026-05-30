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
import {
  PredictionSummaryMvpTile,
  PredictionSummaryNationalTile,
} from "@/components/fantasy/PredictionSummaryTile";
import { isFantasyCompetitionLocked } from "@/lib/fantasy-lock";
import { clsx } from "@/lib/utils";

type PredictionField = "champion" | "mvp" | "disappointment" | "revelation";

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
  /** Texto bajo el resumen (p. ej. formación registrada). */
  footerNote?: string;
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
  footerNote,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PredictionField | null>(null);

  const [championTeamId, setChampionTeamId] = useState(fantasyTeam.championTeamId ?? "");
  const [mvpPlayerId, setMvpPlayerId] = useState(fantasyTeam.tournamentMvpPlayerId ?? "");
  const [disappointmentId, setDisappointmentId] = useState(fantasyTeam.disappointmentTeamId ?? "");
  const [revelationId, setRevelationId] = useState(existingPicks?.revelationTeamId ?? "");

  const competitionLocked = isFantasyCompetitionLocked();
  const isLocked =
    fantasyTeam.locked || picksLocked || competitionLocked || isPending;

  const squadIds = useMemo(
    () => new Set(squadPlayers.map((p) => p.id)),
    [squadPlayers],
  );

  const revelationTeams = getEligibleRevelationTeams(tournamentTeams);
  const disappointmentTeams = getEligibleDisappointmentTeams(tournamentTeams);

  const ntMap = new Map(nationalTeams.map((t) => [t.id, t]));
  const ttMap = new Map(tournamentTeams.map((t) => [t.id, t]));

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

  function tournamentTeamAsCrest(id: string) {
    const tt = ttMap.get(id);
    const nt = ntMap.get(id);
    if (tt) return { id: tt.id, name: tt.name, logoUrl: tt.crestUrl };
    if (nt) return nt;
    return { id, name: id, logoUrl: undefined };
  }

  function toggleField(field: PredictionField) {
    if (isLocked) return;
    setEditing((prev) => (prev === field ? null : field));
    setSaved(false);
    setError(null);
  }

  function handleChange(setter: (v: string) => void, value: string) {
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
      else {
        setSaved(true);
        setEditing(null);
      }
    });
  }

  const fieldLabels: Record<PredictionField, string> = {
    champion: "Campeón del torneo",
    mvp: "MVP del torneo",
    disappointment: "Selección decepción",
    revelation: "Selección revelación",
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Predicciones del torneo
      </p>
      {!isLocked && (
        <p className="-mt-2 mb-3 text-[10px] text-[var(--muted)]">
          Toca una casilla para editarla
        </p>
      )}

      <div
        className={clsx(
          "grid grid-cols-2 gap-3",
          showRevelation ? "sm:grid-cols-4" : "sm:grid-cols-3",
        )}
      >
        <PredictionSummaryNationalTile
          label="Campeona"
          team={championTeamId ? ntMap.get(championTeamId) ?? tournamentTeamAsCrest(championTeamId) : null}
          teamId={championTeamId || undefined}
          onClick={() => toggleField("champion")}
          disabled={isLocked}
          active={editing === "champion"}
        />
        {showRevelation && (
          <PredictionSummaryNationalTile
            label="Revelación"
            team={revelationId ? tournamentTeamAsCrest(revelationId) : null}
            teamId={revelationId || undefined}
            onClick={() => toggleField("revelation")}
            disabled={isLocked}
            active={editing === "revelation"}
          />
        )}
        <PredictionSummaryNationalTile
          label="Decepción"
          team={disappointmentId ? tournamentTeamAsCrest(disappointmentId) : null}
          teamId={disappointmentId || undefined}
          onClick={() => toggleField("disappointment")}
          disabled={isLocked}
          active={editing === "disappointment"}
        />
        <PredictionSummaryMvpTile
          player={mvpPlayer}
          onClick={() => toggleField("mvp")}
          disabled={isLocked}
          active={editing === "mvp"}
        />
      </div>

      {footerNote && (
        <p className="mt-3 text-[10px] text-[var(--muted)]">{footerNote}</p>
      )}

      {editing && !isLocked && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{fieldLabels[editing]}</p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              Cerrar
            </button>
          </div>

          {editing === "champion" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--muted)]">
                La selección que levantará el trofeo. La cuota determina tus puntos bonus si aciertas.
              </p>
              {championTeamId && ntMap.get(championTeamId) ? (
                <NationalTeamHeroBanner
                  team={ntMap.get(championTeamId)!}
                  subtitle={`Campeón · cuota x${(ntMap.get(championTeamId)!.odds ?? 5).toFixed(1)} · hasta +${Math.ceil((ntMap.get(championTeamId)!.odds ?? 5) * 5)} pts`}
                  onClear={() => handleChange(setChampionTeamId, "")}
                />
              ) : (
                <NationalTeamPickerSelect
                  name="prediction-champion"
                  teams={[...availableChampion].sort((a, b) => (a.odds ?? 99) - (b.odds ?? 99))}
                  value={championTeamId}
                  onChange={(id) => handleChange(setChampionTeamId, id)}
                  placeholder="Selecciona un equipo…"
                />
              )}
            </div>
          )}

          {editing === "mvp" && (
            <div className="flex flex-col gap-3">
              {mvpPlayer ? (
                <FantasyMvpHeroBanner
                  player={mvpPlayer}
                  onClear={() => handleChange(setMvpPlayerId, "")}
                />
              ) : (
                <FantasyPlayerSearchPicker
                  players={allPlayers}
                  nationalTeams={nationalTeams}
                  value={mvpPlayerId || null}
                  onChange={(id) => handleChange(setMvpPlayerId, id ?? "")}
                  restrictToPlayerIds={squadIds}
                  hint="El mejor jugador del Mundial — debe ser uno de los 15 de tu plantilla."
                  placeholder="Buscar en tu plantilla…"
                />
              )}
            </div>
          )}

          {editing === "disappointment" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--muted)]">
                Favorita que crees que no cumplirá (cuota ≤ {DISAPPOINTMENT_MAX_ODDS}).
              </p>
              <DisappointmentScoringHint />
              <PredictionTournamentTeamPicker
                selectName="prediction-disappointment"
                options={availableDisappointment}
                value={disappointmentId}
                onChange={(id) => handleChange(setDisappointmentId, id)}
                placeholder="Elige tu decepción…"
                formatOdds={formatOdds}
              />
            </div>
          )}

          {editing === "revelation" && showRevelation && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--muted)]">
                Underdog que puede sorprender. Solo equipos con cuota ≥ {REVELATION_MIN_ODDS}.
              </p>
              <RevelationScoringHint />
              <PredictionTournamentTeamPicker
                selectName="prediction-revelation"
                options={availableRevelation}
                value={revelationId}
                onChange={(id) => handleChange(setRevelationId, id)}
                placeholder="Elige tu tapada…"
                formatOdds={formatOdds}
              />
            </div>
          )}
        </div>
      )}

      {(error || saved || (!isLocked && editing)) && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <span>✓</span> Predicciones guardadas
            </p>
          )}
          {!isLocked && editing && (
            <button
              onClick={handleSave}
              disabled={isPending || !allFilled}
              className="w-full rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
            >
              {isPending ? "Guardando…" : "Guardar predicciones"}
            </button>
          )}
        </div>
      )}

      {isLocked && !isPending && (
        <p className="mt-3 text-[10px] text-[var(--muted)]">
          🔒 Las predicciones están bloqueadas y ya no pueden modificarse.
        </p>
      )}
    </div>
  );
}

function DisappointmentScoringHint() {
  return (
    <ScoringTable
      rows={[
        { stage: "group_stage", pts: calculateDisappointmentPoints("group_stage") },
        { stage: "round_of_16", pts: calculateDisappointmentPoints("round_of_16") },
        { stage: "quarter_finals", pts: calculateDisappointmentPoints("quarter_finals") },
        { stage: "semi_finals", pts: calculateDisappointmentPoints("semi_finals") },
        { stage: "final", pts: calculateDisappointmentPoints("final") },
        { stage: "winner", pts: calculateDisappointmentPoints("winner") },
      ]}
    />
  );
}

function RevelationScoringHint() {
  return (
    <ScoringTable
      rows={[
        { stage: "round_of_16", pts: calculateRevelationPoints("round_of_16") },
        { stage: "quarter_finals", pts: calculateRevelationPoints("quarter_finals") },
        { stage: "semi_finals", pts: calculateRevelationPoints("semi_finals") },
        { stage: "final", pts: calculateRevelationPoints("final") },
        { stage: "winner", pts: calculateRevelationPoints("winner") },
      ]}
    />
  );
}

function ScoringTable({
  rows,
}: {
  rows: { stage: Parameters<typeof stageLabelEs>[0]; pts: number }[];
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer select-none list-none items-center gap-1 text-xs text-[var(--muted)] hover:underline">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        ¿Cómo se puntúa?
      </summary>
      <div className="mt-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
        <table className="w-full text-[10px]">
          <tbody>
            {rows.map(({ stage, pts }) => (
              <tr key={stage} className="border-b border-[var(--border)] last:border-0">
                <td className="px-2 py-1 text-[var(--muted)]">{stageLabelEs(stage)}</td>
                <td
                  className={[
                    "px-2 py-1 text-right font-semibold tabular-nums",
                    pts > 0
                      ? "text-green-600 dark:text-green-400"
                      : pts < 0
                        ? "text-red-500"
                        : "text-[var(--muted)]",
                  ].join(" ")}
                >
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
