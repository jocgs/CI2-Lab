"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { FantasyNationalTeam, FantasyPlayer, FantasyTeam } from "@/types/fantasy";
import type { TournamentTeam, UserTournamentPicks } from "@/types/picks";
import { saveAllPredictionsAction } from "@/app/fantasy/bola-de-cristal/prediction-actions";
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
import { getTeamsOutsideUefaConmebol } from "@/lib/bola-de-cristal";
import { NationalTeamPickerSelect } from "@/components/fantasy/NationalTeamPickerSelect";
import { NationalTeamHeroBanner } from "@/components/fantasy/NationalTeamHeroBanner";
import { PredictionTournamentTeamPicker } from "@/components/fantasy/PredictionTournamentTeamPicker";
import { BolaDeCristalPlayerAwardField } from "@/components/fantasy/BolaDeCristalPlayerAwardField";
import { isFantasyCompetitionLocked } from "@/lib/fantasy-lock";

interface Props {
  fantasyTeam: FantasyTeam;
  allPlayers: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  tournamentTeams: TournamentTeam[];
  existingPicks: UserTournamentPicks | null;
  competitionId: string;
  tournamentId: string;
  leagueId?: string | null;
  picksLocked: boolean;
  showGlobalAwards?: boolean;
  returnHref: string;
  returnLabel?: string;
}

export function PredictionsForm({
  fantasyTeam,
  allPlayers,
  nationalTeams,
  tournamentTeams,
  existingPicks,
  competitionId,
  tournamentId,
  leagueId = null,
  picksLocked,
  showGlobalAwards = true,
  returnHref,
  returnLabel = "Mi equipo",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [championTeamId, setChampionTeamId] = useState(fantasyTeam.championTeamId ?? "");
  const [disappointmentId, setDisappointmentId] = useState(fantasyTeam.disappointmentTeamId ?? "");
  const [revelationId, setRevelationId] = useState(existingPicks?.revelationTeamId ?? "");

  const [ballonDOrId, setBallonDOrId] = useState(
    existingPicks?.ballonDOrPlayerId ?? fantasyTeam.tournamentMvpPlayerId ?? "",
  );
  const [goldenBootId, setGoldenBootId] = useState(existingPicks?.goldenBootPlayerId ?? "");
  const [goldenGloveId, setGoldenGloveId] = useState(existingPicks?.goldenGlovePlayerId ?? "");
  const [bestYoungId, setBestYoungId] = useState(existingPicks?.bestYoungPlayerId ?? "");
  const [topAssistId, setTopAssistId] = useState(existingPicks?.topAssistPlayerId ?? "");
  const [bestGoalTeamId, setBestGoalTeamId] = useState(existingPicks?.bestGoalTeamId ?? "");
  const [bestGroupTeamId, setBestGroupTeamId] = useState(existingPicks?.bestGroupStageTeamId ?? "");
  const [worstGroupTeamId, setWorstGroupTeamId] = useState(existingPicks?.worstGroupStageTeamId ?? "");
  const [bestNonUefaId, setBestNonUefaId] = useState(existingPicks?.bestNonUefaConmebolTeamId ?? "");

  const competitionLocked = isFantasyCompetitionLocked();
  const isLocked = fantasyTeam.locked || picksLocked || competitionLocked || isPending;

  const revelationTeams = getEligibleRevelationTeams(tournamentTeams);
  const disappointmentTeams = getEligibleDisappointmentTeams(tournamentTeams);
  const nonUefaConmebolTeams = useMemo(
    () => getTeamsOutsideUefaConmebol(tournamentTeams),
    [tournamentTeams],
  );
  const nonUefaNationalTeams = useMemo(
    () => nationalTeams.filter((t) => nonUefaConmebolTeams.some((tt) => tt.id === t.id)),
    [nationalTeams, nonUefaConmebolTeams],
  );

  const ntMap = new Map(nationalTeams.map((t) => [t.id, t]));

  const availableChampion = nationalTeams.filter(
    (t) =>
      t.id === championTeamId ||
      (t.id !== disappointmentId && t.id !== revelationId),
  );
  const availableDisappointment = disappointmentTeams.filter(
    (t) =>
      t.id === disappointmentId ||
      (t.id !== championTeamId && t.id !== revelationId),
  );
  const availableRevelation = revelationTeams.filter(
    (t) =>
      t.id === revelationId ||
      (t.id !== championTeamId && t.id !== disappointmentId),
  );

  const leagueFilled = Boolean(championTeamId && disappointmentId);
  const globalFilled = Boolean(
    leagueFilled &&
      revelationId &&
      ballonDOrId &&
      goldenBootId &&
      goldenGloveId &&
      bestYoungId &&
      topAssistId &&
      bestGoalTeamId &&
      bestGroupTeamId &&
      worstGroupTeamId &&
      bestNonUefaId,
  );
  const allFilled = showGlobalAwards ? globalFilled : leagueFilled;

  function handleChange(setter: (v: string) => void, value: string) {
    setter(value);
    setSaved(false);
    setError(null);
  }

  function handleSave() {
    if (!allFilled) {
      setError(
        showGlobalAwards
          ? "Rellena todas las predicciones antes de guardar."
          : "Rellena campeón y decepción antes de guardar.",
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
        disappointmentTeamId: disappointmentId,
        revelationTeamId: revelationId,
        ballonDOrPlayerId: ballonDOrId,
        goldenBootPlayerId: goldenBootId,
        goldenGlovePlayerId: goldenGloveId,
        bestYoungPlayerId: bestYoungId,
        topAssistPlayerId: topAssistId,
        bestGoalTeamId,
        bestGroupStageTeamId: bestGroupTeamId,
        worstGroupStageTeamId: worstGroupTeamId,
        bestNonUefaConmebolTeamId: bestNonUefaId,
      });
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/fantasy"
          className="text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Fantasy
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <Link href={returnHref} className="text-[var(--muted)] hover:text-[var(--fg)]">
          {returnLabel}
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="font-medium">Bola de cristal</span>
      </div>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="font-semibold">🏆 Torneo y cuotas</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Campeón, decepción{showGlobalAwards ? " y revelación" : ""}.
          </p>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <TeamAwardField
            label="🏆 Campeón del torneo"
            hint="La selección que levantará el trofeo."
            teams={availableChampion}
            value={championTeamId}
            onChange={(id) => handleChange(setChampionTeamId, id)}
            disabled={isLocked}
            name="prediction-champion"
            ntMap={ntMap}
            sortByOdds
          />

          <div className="rounded-2xl border-2 border-rose-200 overflow-hidden dark:border-rose-800">
            <div className="bg-gradient-to-r from-rose-50 to-red-50 px-5 py-3 dark:from-rose-950/40 dark:to-red-950/30">
              <p className="font-semibold text-sm">💣 Selección decepción</p>
              <p className="text-xs text-[var(--muted)]">Solo favoritas — cuota ≤ {DISAPPOINTMENT_MAX_ODDS}</p>
            </div>
            <div className="flex flex-col gap-3 p-4">
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

          {showGlobalAwards && (
            <div className="rounded-2xl border-2 border-amber-300 overflow-hidden dark:border-amber-700">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 dark:from-amber-950/40 dark:to-yellow-950/30">
                <p className="font-semibold text-sm">⭐ Selección revelación / tapada</p>
                <p className="text-xs text-[var(--muted)]">Solo tapadas — cuota ≥ {REVELATION_MIN_ODDS}</p>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <ScoringTable
                  rows={[
                    { stage: "round_of_16", pts: calculateRevelationPoints("round_of_16") },
                    { stage: "quarter_finals", pts: calculateRevelationPoints("quarter_finals") },
                    { stage: "semi_finals", pts: calculateRevelationPoints("semi_finals") },
                    { stage: "final", pts: calculateRevelationPoints("final") },
                    { stage: "winner", pts: calculateRevelationPoints("winner") },
                  ]}
                />
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

      {showGlobalAwards && (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h3 className="font-semibold">🥇 Premios individuales FIFA</h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Elige entre todos los jugadores del catálogo del Mundial.
              </p>
            </div>
            <div className="flex flex-col gap-5 p-5">
              <BolaDeCristalPlayerAwardField
                label="🥇 Balón de oro"
                title="Balón de oro"
                hint="El mejor jugador del torneo."
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={ballonDOrId}
                onChange={(id) => handleChange(setBallonDOrId, id)}
                disabled={isLocked}
              />
              <BolaDeCristalPlayerAwardField
                label="👟 Bota de oro"
                title="Bota de oro"
                hint="El máximo goleador del torneo."
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={goldenBootId}
                onChange={(id) => handleChange(setGoldenBootId, id)}
                disabled={isLocked}
              />
              <BolaDeCristalPlayerAwardField
                label="🧤 Guante de oro"
                title="Guante de oro"
                hint="El mejor portero del torneo."
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={goldenGloveId}
                onChange={(id) => handleChange(setGoldenGloveId, id)}
                disabled={isLocked}
                filterPosition="GK"
                placeholder="Buscar portero…"
              />
              <BolaDeCristalPlayerAwardField
                label="🌱 Mejor jugador joven"
                title="Mejor jugador joven"
                hint="Tu apuesta al mejor talento joven del Mundial."
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={bestYoungId}
                onChange={(id) => handleChange(setBestYoungId, id)}
                disabled={isLocked}
              />
              <BolaDeCristalPlayerAwardField
                label="🎯 Máximo asistente"
                title="Máximo asistente"
                hint="El jugador que más asistencias dará en el torneo."
                players={allPlayers}
                nationalTeams={nationalTeams}
                value={topAssistId}
                onChange={(id) => handleChange(setTopAssistId, id)}
                disabled={isLocked}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h3 className="font-semibold">🌍 Premios por selección</h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Predicciones sobre selecciones nacionales.
              </p>
            </div>
            <div className="flex flex-col gap-5 p-5">
              <TeamAwardField
                label="⚽ Mejor gol del torneo"
                hint="La selección a la que atribuyes el mejor gol del Mundial."
                teams={nationalTeams}
                value={bestGoalTeamId}
                onChange={(id) => handleChange(setBestGoalTeamId, id)}
                disabled={isLocked}
                name="prediction-best-goal"
                ntMap={ntMap}
              />
              <TeamAwardField
                label="📈 Mejor selección en fase de grupos"
                hint="La selección que mejor rendimiento tendrá en la fase de grupos."
                teams={nationalTeams}
                value={bestGroupTeamId}
                onChange={(id) => handleChange(setBestGroupTeamId, id)}
                disabled={isLocked}
                name="prediction-best-group"
                ntMap={ntMap}
              />
              <TeamAwardField
                label="📉 Peor selección en fase de grupos"
                hint="La selección que peor lo pasará en la fase de grupos."
                teams={nationalTeams}
                value={worstGroupTeamId}
                onChange={(id) => handleChange(setWorstGroupTeamId, id)}
                disabled={isLocked}
                name="prediction-worst-group"
                ntMap={ntMap}
              />
              <TeamAwardField
                label="🌏 Mejor fuera de UEFA / CONMEBOL"
                hint="Mejor selección de África, Asia, Norteamérica u Oceanía (sin europeas ni sudamericanas)."
                teams={nonUefaNationalTeams}
                value={bestNonUefaId}
                onChange={(id) => handleChange(setBestNonUefaId, id)}
                disabled={isLocked}
                name="prediction-best-non-uefa"
                ntMap={ntMap}
              />
            </div>
          </section>
        </>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && !error && (
        <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4 dark:border-green-800 dark:bg-green-950/30">
          <p className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-300">
            <span>✓</span> Predicciones guardadas correctamente
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={returnHref}
              className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Volver a {returnLabel} →
            </Link>
            <Link
              href="/fantasy"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)]"
            >
              Ir a Fantasy
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        {isLocked && !isPending ? (
          <p className="text-xs text-[var(--muted)]">
            🔒 Las predicciones están bloqueadas y ya no pueden modificarse.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !allFilled}
            className="rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Guardando…" : "Guardar predicciones"}
          </button>
        )}
        <Link
          href={returnHref}
          className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
        >
          ← {returnLabel}
        </Link>
        <Link
          href="/fantasy"
          className="text-sm font-medium text-[var(--brand-strong)] hover:underline"
        >
          Fantasy
        </Link>
      </div>
    </div>
  );
}

function TeamAwardField({
  label,
  hint,
  teams,
  value,
  onChange,
  disabled,
  name,
  ntMap,
  sortByOdds,
}: {
  label: string;
  hint: string;
  teams: FantasyNationalTeam[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  name: string;
  ntMap: Map<string, FantasyNationalTeam>;
  sortByOdds?: boolean;
}) {
  const sorted = sortByOdds
    ? [...teams].sort((a, b) => (a.odds ?? 99) - (b.odds ?? 99))
    : [...teams].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const selected = value ? ntMap.get(value) : undefined;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <p className="mb-2 text-xs text-[var(--muted)]">{hint}</p>
      {selected ? (
        <NationalTeamHeroBanner
          team={selected}
          onClear={disabled ? undefined : () => onChange("")}
        />
      ) : (
        <NationalTeamPickerSelect
          name={name}
          teams={sorted}
          value={value}
          onChange={onChange}
          placeholder="Selecciona una selección…"
          disabled={disabled}
        />
      )}
    </div>
  );
}

function ScoringTable({
  rows,
}: {
  rows: { stage: Parameters<typeof stageLabelEs>[0]; pts: number }[];
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer select-none list-none items-center gap-1 text-xs hover:underline">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        ¿Cómo se puntúa?
      </summary>
      <div className="mt-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-[10px]">
          <tbody>
            {rows.map(({ stage, pts }) => (
              <tr key={stage} className="border-b border-[var(--border)] last:border-0">
                <td className="px-2 py-1 text-[var(--muted)]">{stageLabelEs(stage)}</td>
                <td
                  className={[
                    "px-2 py-1 text-right font-semibold tabular-nums",
                    pts > 0 ? "text-green-600 dark:text-green-400" : pts < 0 ? "text-red-500" : "text-[var(--muted)]",
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
