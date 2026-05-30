"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  FantasyPlayer,
  FantasyNationalTeam,
  Position,
  Formation,
  FantasyStartingEleven,
  FantasyBench,
} from "@/types/fantasy";
import type { TournamentTeam } from "@/types/picks";
import { FantasyPlayerCard } from "@/components/fantasy/FantasyPlayerCard";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { createFantasyTeamAction, updateFantasyTeamAction } from "./actions";
import { FantasyPlayerSearchPicker } from "@/components/fantasy/FantasyPlayerSearchPicker";
import { FantasySquadPitchPreview } from "@/components/fantasy/FantasySquadPitchPreview";
import { NationalTeamCrest } from "@/components/fantasy/NationalTeamCrest";
import { NationalTeamPickerSelect } from "@/components/fantasy/NationalTeamPickerSelect";
import { NationalTeamHeroBanner } from "@/components/fantasy/NationalTeamHeroBanner";
import { FantasyMvpHeroBanner } from "@/components/fantasy/FantasyMvpHeroBanner";
import { PredictionTournamentTeamPicker } from "@/components/fantasy/PredictionTournamentTeamPicker";
import {
  PredictionSummaryMvpTile,
  PredictionSummaryNationalTile,
} from "@/components/fantasy/PredictionSummaryTile";
import type { FantasyTeam } from "@/types/fantasy";
import { FORMATION_OPTIONS, getFormationRequirements } from "@/lib/fantasy-formations";
import { saveAllPredictionsAction } from "@/app/fantasy/my-team/prediction-actions";
import {
  getEligibleRevelationTeams,
  getEligibleDisappointmentTeams,
  formatOdds,
  REVELATION_MIN_ODDS,
  DISAPPOINTMENT_MAX_ODDS,
} from "@/lib/tournament-picks";
import { clsx } from "@/lib/utils";

// ─── Step hints ─────────────────────────────────────────────────────────────

function buildStepConfig(formation: Formation) {
  const requirements = getFormationRequirements(formation);

  return [
    {
      step: 1,
      title: "Nombre del equipo",
      hint: "Algo épico. O una ironía. Ambas valen.",
      position: null,
      count: null,
    },
    {
      step: 2,
      title: "Elige formación",
      hint: "Escoge tu esquema antes de completar el once.",
      position: null,
      count: null,
    },
    {
      step: 3,
      title: "Portero titular",
      hint: "El muro o el meme. Tú decides.",
      position: "GK" as Position,
      count: 1,
    },
    {
      step: 4,
      title: `${requirements.defenders} Defensas titulares`,
      hint: "Gente que sabe lo que es un fuera de juego (más o menos).",
      position: "DEF" as Position,
      count: requirements.defenders,
    },
    {
      step: 5,
      title: `${requirements.midfielders} Centrocampistas titulares`,
      hint: "Los que dan el pase de gol y nunca marcan.",
      position: "MID" as Position,
      count: requirements.midfielders,
    },
    {
      step: 6,
      title: `${requirements.forwards} Delanteros titulares`,
      hint: "Aquí van los que supuestamente meten goles.",
      position: "FWD" as Position,
      count: requirements.forwards,
    },
    {
      step: 7,
      title: "4 Reservas (1 por posición)",
      hint: "Los que calientan el banquillo y te salvan un día.",
      position: null,
      count: 4,
    },
    {
      step: 8,
      title: "Predicciones del torneo",
      hint: "Campeón, MVP, decepción y tu selección revelación (tapada).",
      position: null,
      count: null,
    },
    {
      step: 9,
      title: "Confirmación",
      hint: "Última oportunidad para arrepentirte.",
      position: null,
      count: null,
    },
  ] as const;
}

// ─── Position labels ────────────────────────────────────────────────────────

const POS_LABELS: Record<Position, string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FWD: "Delantero",
};

const BENCH_POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  tournamentTeams: TournamentTeam[];
  tournamentId: string;
  competitionId: string;
  leagueId?: string | null;
  leagueName?: string;
  existingTeam?: FantasyTeam | null;
  editMode?: boolean;
  initialRevelationTeamId?: string | null;
}

function initialFromTeam(team: FantasyTeam) {
  const se = team.startingEleven;
  return {
    teamName: team.teamName,
    formation: (se.formation ?? "4-3-3") as Formation,
    goalkeeperId: se.goalkeeperId,
    defenderIds: [...se.defenderIds],
    midfielderIds: [...se.midfielderIds],
    forwardIds: [...se.forwardIds],
    bench: { ...team.bench },
    captainId: team.captainId,
    championTeamId: team.championTeamId ?? null,
    disappointmentTeamId: team.disappointmentTeamId ?? null,
    tournamentMvpId: team.tournamentMvpPlayerId ?? null,
  };
}

export function FantasyBuilderClient({
  players,
  nationalTeams,
  tournamentTeams,
  tournamentId,
  competitionId,
  leagueId = null,
  leagueName,
  existingTeam = null,
  editMode = false,
  initialRevelationTeamId = null,
}: Props) {
  const isLeagueTeam = Boolean(leagueId);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initial = existingTeam && editMode ? initialFromTeam(existingTeam) : null;

  // ── Wizard state ──
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // ── Form data ──
  const [teamName, setTeamName] = useState(initial?.teamName ?? "");
  const [formation, setFormation] = useState<Formation>(initial?.formation ?? "4-3-3");
  const [goalkeeperId, setGoalkeeperId] = useState<string | null>(initial?.goalkeeperId ?? null);
  const [defenderIds, setDefenderIds] = useState<string[]>(initial?.defenderIds ?? []);
  const [midfielderIds, setMidfielderIds] = useState<string[]>(initial?.midfielderIds ?? []);
  const [forwardIds, setForwardIds] = useState<string[]>(initial?.forwardIds ?? []);
  const [bench, setBench] = useState<Partial<FantasyBench>>(initial?.bench ?? {});
  const [captainId, setCaptainId] = useState<string | null>(initial?.captainId ?? null);

  // ── Predicciones ──
  const [championTeamId, setChampionTeamId] = useState<string | null>(initial?.championTeamId ?? null);
  const [disappointmentTeamId, setDisappointmentTeamId] = useState<string | null>(
    initial?.disappointmentTeamId ?? null,
  );
  const [revelationTeamId, setRevelationTeamId] = useState<string | null>(
    initialRevelationTeamId ?? null,
  );
  const [tournamentMvpId, setTournamentMvpId] = useState<string | null>(initial?.tournamentMvpId ?? null);

  // ── Filter state ──
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<Position | "all">("all");
  const [search, setSearch] = useState("");

  const formationRequirements = useMemo(() => getFormationRequirements(formation), [formation]);
  const stepConfig = useMemo(() => buildStepConfig(formation), [formation]);
  const config = stepConfig[step - 1];

  function handleFormationSelect(nextFormation: Formation) {
    setError(null);
    if (formation === nextFormation) return;
    setFormation(nextFormation);
    setGoalkeeperId(null);
    setDefenderIds([]);
    setMidfielderIds([]);
    setForwardIds([]);
    setBench({});
    setCaptainId(null);
    setBenchPositionIndex(0);
  }

  // ─── Already selected player IDs ─────────────────────────────────────────
  const allStarterIds = useMemo(
    () =>
      [goalkeeperId, ...defenderIds, ...midfielderIds, ...forwardIds].filter(
        (id): id is string => !!id,
      ),
    [goalkeeperId, defenderIds, midfielderIds, forwardIds],
  );

  const allBenchIds = useMemo(
    () =>
      [bench.goalkeeperId, bench.defenderId, bench.midfielderId, bench.forwardId].filter(
        (id): id is string => !!id,
      ),
    [bench],
  );

  // ─── Cupo por selección nacional (máx 3 en toda la plantilla) ─────────────
  const teamCountMap = useMemo(() => {
    const map = new Map<string, number>();
    const allIds = [...allStarterIds, ...allBenchIds];
    for (const id of allIds) {
      const p = players.find((pl) => pl.id === id);
      if (p) map.set(p.nationalTeamId, (map.get(p.nationalTeamId) ?? 0) + 1);
    }
    return map;
  }, [allStarterIds, allBenchIds, players]);

  /** Devuelve true si el jugador no puede añadirse por cupo de selección. */
  function isPlayerDisabled(playerId: string): boolean {
    const player = players.find((p) => p.id === playerId);
    if (!player) return false;
    const alreadySelected =
      allStarterIds.includes(playerId) || allBenchIds.includes(playerId);
    if (alreadySelected) return false;
    return (teamCountMap.get(player.nationalTeamId) ?? 0) >= 3;
  }

  function disabledReason(playerId: string): string | undefined {
    const player = players.find((p) => p.id === playerId);
    if (!player) return undefined;
    const count = teamCountMap.get(player.nationalTeamId) ?? 0;
    if (count >= 3) return `Máximo 3 jugadores de ${player.nationalTeamName} (${count}/3)`;
    return undefined;
  }

  // ─── Filtered players for current step ───────────────────────────────────
  const filteredPlayers = useMemo(() => {
    let pool = players;

    if (config.position) {
      pool = pool.filter((p) => p.position === config.position);
    }

    if (step === 7) {
      pool = pool.filter((p) => !allStarterIds.includes(p.id));
    }

    if (step === 8 || step === 9) {
      return [];
    }

    if (filterTeam !== "all") {
      pool = pool.filter((p) => p.nationalTeamId === filterTeam);
    }

    if (filterPosition !== "all") {
      pool = pool.filter((p) => p.position === filterPosition);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nationalTeamName.toLowerCase().includes(q),
      );
    }

    return pool.slice(0, 120);
  }, [players, config.position, step, filterTeam, filterPosition, search, allStarterIds]);

  // ─── Step validation ──────────────────────────────────────────────────────
  const canAdvance = useMemo(() => {
    if (step === 1) return teamName.trim().length > 0;
    if (step === 2) return !!formation;
    if (step === 3) return !!goalkeeperId;
    if (step === 4) return defenderIds.length === formationRequirements.defenders;
    if (step === 5) return midfielderIds.length === formationRequirements.midfielders;
    if (step === 6) return forwardIds.length === formationRequirements.forwards;
    if (step === 7)
      return !!(bench.goalkeeperId && bench.defenderId && bench.midfielderId && bench.forwardId);
    if (step === 8) {
      const base = !!(championTeamId && disappointmentTeamId && tournamentMvpId);
      return isLeagueTeam ? base : base && !!revelationTeamId;
    }
    return true;
  }, [
    step,
    teamName,
    formation,
    formationRequirements.defenders,
    formationRequirements.midfielders,
    formationRequirements.forwards,
    goalkeeperId,
    defenderIds,
    midfielderIds,
    forwardIds,
    bench,
    championTeamId,
    disappointmentTeamId,
    revelationTeamId,
    tournamentMvpId,
    isLeagueTeam,
    editMode,
  ]);

  const squadPlayers = useMemo(() => {
    const ids = new Set([...allStarterIds, ...allBenchIds]);
    return players.filter((p) => ids.has(p.id));
  }, [players, allStarterIds, allBenchIds]);

  // ─── Bench step — current position being selected ────────────────────────
  const [benchPositionIndex, setBenchPositionIndex] = useState(0);
  const currentBenchPosition = BENCH_POSITIONS[benchPositionIndex];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handlePlayerSelect(playerId: string) {
    setError(null);
    if (isPlayerDisabled(playerId)) {
      const player = players.find((p) => p.id === playerId);
      setError(
        `Máximo 3 jugadores de ${player?.nationalTeamName ?? "la misma selección"}. Esto no es poner a Francia entera.`,
      );
      return;
    }
    if (step === 9) {
      // Handled in confirmation
    } else if (step === 3) {
      setGoalkeeperId(goalkeeperId === playerId ? null : playerId);
    } else if (step === 4) {
      if (defenderIds.includes(playerId)) {
        setDefenderIds(defenderIds.filter((id) => id !== playerId));
      } else if (defenderIds.length < formationRequirements.defenders) {
        setDefenderIds([...defenderIds, playerId]);
      }
    } else if (step === 5) {
      if (midfielderIds.includes(playerId)) {
        setMidfielderIds(midfielderIds.filter((id) => id !== playerId));
      } else if (midfielderIds.length < formationRequirements.midfielders) {
        setMidfielderIds([...midfielderIds, playerId]);
      }
    } else if (step === 6) {
      if (forwardIds.includes(playerId)) {
        setForwardIds(forwardIds.filter((id) => id !== playerId));
      } else if (forwardIds.length < formationRequirements.forwards) {
        setForwardIds([...forwardIds, playerId]);
      }
    } else if (step === 7) {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      const pos = player.position;
      const keyMap: Record<Position, keyof FantasyBench> = {
        GK: "goalkeeperId",
        DEF: "defenderId",
        MID: "midfielderId",
        FWD: "forwardId",
      };
      const key = keyMap[pos];
      setBench((prev) => ({
        ...prev,
        [key]: prev[key] === playerId ? undefined : playerId,
      }));
      const nextIdx = BENCH_POSITIONS.findIndex(
        (p, i) => i > benchPositionIndex && !bench[keyMap[p]],
      );
      if (nextIdx !== -1) setBenchPositionIndex(nextIdx);
    }
  }

  function isPlayerSelected(playerId: string): boolean {
    if (step === 3) return goalkeeperId === playerId;
    if (step === 4) return defenderIds.includes(playerId);
    if (step === 5) return midfielderIds.includes(playerId);
    if (step === 6) return forwardIds.includes(playerId);
    if (step === 7) return allBenchIds.includes(playerId);
    return false;
  }

  function handleSubmit() {
    if (!goalkeeperId) { setError("Falta el portero."); return; }
    if (defenderIds.length !== formationRequirements.defenders) { setError("Faltan defensas."); return; }
    if (midfielderIds.length !== formationRequirements.midfielders) { setError("Faltan centrocampistas."); return; }
    if (forwardIds.length !== formationRequirements.forwards) { setError("Faltan delanteros."); return; }
    if (!bench.goalkeeperId || !bench.defenderId || !bench.midfielderId || !bench.forwardId) {
      setError("Banquillo incompleto."); return;
    }
    if (!championTeamId || !disappointmentTeamId || !tournamentMvpId) {
      setError("Completa campeón, MVP y decepción.");
      return;
    }
    if (!isLeagueTeam && !revelationTeamId) {
      setError("Elige tu selección revelación (solo en el Fantasy global).");
      return;
    }

    // Auto-asignación de capitán por defecto al primer delantero o jugador disponible si no se asignó explícitamente
    const finalCaptainId = captainId ?? forwardIds[0] ?? midfielderIds[0] ?? goalkeeperId;

    const startingEleven: FantasyStartingEleven = {
      formation,
      goalkeeperId,
      defenderIds: defenderIds as any,
      midfielderIds: midfielderIds as any,
      forwardIds: forwardIds as any,
    };
    const fullBench: FantasyBench = {
      goalkeeperId: bench.goalkeeperId!,
      defenderId: bench.defenderId!,
      midfielderId: bench.midfielderId!,
      forwardId: bench.forwardId!,
    };

    startTransition(async () => {
      const squadPayload = {
        competitionId,
        leagueId,
        teamName,
        startingEleven,
        bench: fullBench,
        captainId: finalCaptainId,
      };

      const result = editMode && existingTeam
        ? await updateFantasyTeamAction(existingTeam.id, squadPayload)
        : await createFantasyTeamAction(squadPayload);

      if (result.error) {
        setError(result.error);
        return;
      }

      const predResult = await saveAllPredictionsAction({
        competitionId,
        tournamentId,
        leagueId,
        championTeamId: championTeamId!,
        tournamentMvpPlayerId: tournamentMvpId!,
        disappointmentTeamId: disappointmentTeamId!,
        revelationTeamId: revelationTeamId ?? "",
      });
      if (predResult.error) {
        setError(predResult.error);
        return;
      }

      router.push(leagueId ? `/fantasy/my-team?league=${leagueId}` : "/fantasy/my-team");
    });
  }

  const pm = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{config.title}</span>
          <span className="text-[var(--muted)]">Paso {step} de 9</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)]">
          <div
            className="h-2 rounded-full bg-[var(--brand)] transition-all"
            style={{ width: `${(step / 9) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)] italic">{config.hint}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* ── STEP 1: Team Name ── */}
      {step === 1 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <label className="block text-sm font-medium mb-2" htmlFor="team-name">
            Nombre del equipo
          </label>
          <input
            id="team-name"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Ej: Los Que Saben, Modo Pulpo, Los Sin Vergüenza..."
            maxLength={40}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)] text-right">
            {teamName.length}/40
          </p>
        </div>
      )}

      {/* Vista del campo (formación + jugadores elegidos) */}
      {step >= 2 && step <= 7 && (
        <FantasySquadPitchPreview
          formation={formation}
          teamName={teamName.trim() || undefined}
          goalkeeperId={goalkeeperId}
          defenderIds={defenderIds}
          midfielderIds={midfielderIds}
          forwardIds={forwardIds}
          bench={step >= 7 ? bench : undefined}
          captainId={captainId}
          players={players}
          nationalTeams={nationalTeams}
          showBench={step >= 7}
          compact={step <= 4}
        />
      )}

      {/* ── STEP 2: Formation ── */}
      {step === 2 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3">
            <label className="block text-sm font-medium">Formación</label>
            <p className="text-xs text-[var(--muted)]">
              Elige el esquema de juego antes de completar el once.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FORMATION_OPTIONS.map((option) => {
              const isActive = formation === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFormationSelect(option.value)}
                  className={clsx(
                    "rounded-2xl border p-4 text-left transition-all",
                    isActive
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--brand)] hover:shadow-sm",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {option.description}
                      </p>
                    </div>
                    {isActive && <span className="text-sm">✅</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEPS 3-6: Starter selection ── */}
      {step >= 3 && step <= 6 && (
        <PlayerPickerPanel
          players={filteredPlayers}
          allPlayers={players}
          nationalTeams={nationalTeams}
          onSelect={handlePlayerSelect}
          isSelected={isPlayerSelected}
          isCaptain={() => false}
          isDisabled={isPlayerDisabled}
          getDisabledReason={disabledReason}
          teamCountMap={teamCountMap}
          filterTeam={filterTeam}
          setFilterTeam={setFilterTeam}
          filterPosition={filterPosition}
          setFilterPosition={setFilterPosition}
          search={search}
          setSearch={setSearch}
          selectedCount={
            step === 3 ? (goalkeeperId ? 1 : 0)
            : step === 4 ? defenderIds.length
            : step === 5 ? midfielderIds.length
            : forwardIds.length
          }
          maxCount={config.count ?? 1}
          label={config.title}
        />
      )}

      {/* ── STEP 7: Bench ── */}
      {step === 7 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium mb-3">Banquillo actual</p>
            <div className="grid grid-cols-4 gap-2">
              {BENCH_POSITIONS.map((pos) => {
                const keyMap: Record<Position, keyof FantasyBench> = {
                  GK: "goalkeeperId",
                  DEF: "defenderId",
                  MID: "midfielderId",
                  FWD: "forwardId",
                };
                const pid = bench[keyMap[pos]];
                const player = pid ? pm.get(pid) : undefined;
                return (
                  <div
                    key={pos}
                    onClick={() => {
                      setBenchPositionIndex(BENCH_POSITIONS.indexOf(pos));
                      setFilterTeam("all");
                      setSearch("");
                    }}
                    className={clsx(
                      "cursor-pointer rounded-xl border p-2 text-center text-xs transition-all",
                      currentBenchPosition === pos
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-[var(--border)] bg-[var(--background)]",
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {player ? (
                        <PlayerAvatar player={player} size={40} priority />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-[var(--border)] text-[10px] text-[var(--muted)]">
                          —
                        </span>
                      )}
                      <p className="truncate text-[10px] text-[var(--muted)]">
                        {player ? player.name : POS_LABELS[pos]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Seleccionando: <strong>{POS_LABELS[currentBenchPosition]}</strong>
            </p>
          </div>

          <PlayerPickerPanel
            boxPlayers={filteredPlayers.filter((p) => p.position === currentBenchPosition)}
            players={filteredPlayers.filter(
              (p) => p.position === currentBenchPosition,
            )}
            allPlayers={players}
            nationalTeams={nationalTeams}
            onSelect={handlePlayerSelect}
            isSelected={isPlayerSelected}
            isCaptain={() => false}
            isDisabled={isPlayerDisabled}
            getDisabledReason={disabledReason}
            teamCountMap={teamCountMap}
            filterTeam={filterTeam}
            setFilterTeam={setFilterTeam}
            filterPosition={filterPosition}
            setFilterPosition={setFilterPosition}
            search={search}
            setSearch={setSearch}
            selectedCount={allBenchIds.length}
            maxCount={4}
            label={`Reserva ${POS_LABELS[currentBenchPosition]}`}
          />
        </div>
      )}

      {step === 8 && (
        <FantasySquadPitchPreview
          formation={formation}
          teamName={teamName.trim() || undefined}
          goalkeeperId={goalkeeperId}
          defenderIds={defenderIds}
          midfielderIds={midfielderIds}
          forwardIds={forwardIds}
          bench={bench}
          captainId={captainId}
          players={players}
          nationalTeams={nationalTeams}
        />
      )}

      {/* ── STEP 8: Predictions ── */}
      {step === 8 && (
        <PredictionsPanel
          players={players}
          nationalTeams={nationalTeams}
          tournamentTeams={tournamentTeams}
          squadPlayerIds={new Set(squadPlayers.map((p) => p.id))}
          championTeamId={championTeamId}
          disappointmentTeamId={disappointmentTeamId}
          revelationTeamId={revelationTeamId}
          tournamentMvpId={tournamentMvpId}
          setChampionTeamId={setChampionTeamId}
          setDisappointmentTeamId={setDisappointmentTeamId}
          setRevelationTeamId={setRevelationTeamId}
          setTournamentMvpId={setTournamentMvpId}
          showRevelation={!isLeagueTeam}
          leagueName={leagueName}
        />
      )}

      {/* ── STEP 9: Confirmation ── */}
      {step === 9 && (
        <>
          <FantasySquadPitchPreview
            formation={formation}
            teamName={teamName}
            goalkeeperId={goalkeeperId}
            defenderIds={defenderIds}
            midfielderIds={midfielderIds}
            forwardIds={forwardIds}
            bench={bench}
            captainId={captainId ?? forwardIds[0]}
            players={players}
            nationalTeams={nationalTeams}
          />
          <ConfirmationPanel
            teamName={teamName}
            goalkeeperId={goalkeeperId}
            defenderIds={defenderIds}
            midfielderIds={midfielderIds}
            forwardIds={forwardIds}
            bench={bench}
            captainId={captainId ?? forwardIds[0]}
            players={players}
            nationalTeams={nationalTeams}
            tournamentTeams={tournamentTeams}
            championTeamId={championTeamId}
            revelationTeamId={revelationTeamId}
            disappointmentTeamId={disappointmentTeamId}
            tournamentMvpId={tournamentMvpId}
          />
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => { setStep(step - 1); setError(null); }}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            ← Atrás
          </button>
        )}
        <div className="flex-1" />
        {step < 9 ? (
          <button
            onClick={() => {
              if (!canAdvance) {
                setError("Completa este paso antes de continuar.");
                return;
              }
              setError(null);
              setStep(step + 1);
              setFilterTeam("all");
              setSearch("");
              if (step === 6) setBenchPositionIndex(0);
            }}
            disabled={!canAdvance}
            className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:opacity-90"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:opacity-90"
          >
            {isPending
              ? "Guardando..."
              : editMode
                ? "Guardar cambios"
                : "¡Crear equipo! 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PlayerPickerPanel ────────────────────────────────────────────────────────

interface PlayerPickerPanelProps {
  players: FantasyPlayer[];
  allPlayers: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  onSelect: (id: string) => void;
  isSelected: (id: string) => boolean;
  isCaptain: (id: string) => boolean;
  isDisabled: (id: string) => boolean;
  getDisabledReason: (id: string) => string | undefined;
  teamCountMap: Map<string, number>;
  filterTeam: string;
  setFilterTeam: (t: string) => void;
  filterPosition: Position | "all";
  setFilterPosition: (p: Position | "all") => void;
  search: string;
  setSearch: (s: string) => void;
  selectedCount: number;
  maxCount: number;
  label: string;
  boxPlayers?: FantasyPlayer[];
}

function PlayerPickerPanel({
  players,
  nationalTeams,
  onSelect,
  isSelected,
  isCaptain,
  isDisabled,
  getDisabledReason,
  teamCountMap,
  filterTeam,
  setFilterTeam,
  filterPosition,
  setFilterPosition,
  search,
  setSearch,
  selectedCount,
  maxCount,
  label,
}: PlayerPickerPanelProps) {
  const presentTeamIds = new Set(players.map((p) => p.nationalTeamId));
  const relevantTeams = nationalTeams
    .filter((t) => presentTeamIds.has(t.id))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-strong)]">
          {selectedCount}/{maxCount}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o país…"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        >
          <option value="all">Todos los países</option>
          {relevantTeams.map((t) => {
            const count = teamCountMap.get(t.id) ?? 0;
            const full = count >= 3;
            return (
              <option key={t.id} value={t.id}>
                {t.name}
                {full ? " (3/3 🔴)" : count > 0 ? ` (${count}/3)` : ""}
              </option>
            );
          })}
        </select>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value as Position | "all")}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        >
          <option value="all">Todas las posiciones</option>
          {(Object.keys(POS_LABELS) as Position[]).map((pos) => (
            <option key={pos} value={pos}>
              {POS_LABELS[pos]}
            </option>
          ))}
        </select>
      </div>

      {/* Cupo por selección — chips de aviso */}
      {Array.from(teamCountMap.entries()).filter(([, c]) => c > 0).length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {Array.from(teamCountMap.entries())
            .filter(([, c]) => c > 0)
            .map(([teamId, count]) => {
              const team = nationalTeams.find((t) => t.id === teamId);
              if (!team) return null;
              const full = count >= 3;
              return (
                <span
                  key={teamId}
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    full
                      ? "bg-red-100 text-red-700"
                      : count === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[var(--brand-soft)] text-[var(--brand-strong)]",
                  )}
                >
                  <NationalTeamCrest team={team} size={14} className="inline-flex" />
                  <span className="max-w-[5.5rem] truncate" title={team.name}>
                    {team.name}
                  </span>{" "}
                  {count}/3{full ? " 🔴" : ""}
                </span>
              );
            })}
        </div>
      )}

      {/* Player list */}
      <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
        {players.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--muted)]">
            No hay jugadores disponibles
          </p>
        ) : (
          players.map((player) => (
            <FantasyPlayerCard
              key={player.id}
              player={player}
              isSelected={isSelected(player.id)}
              isCaptain={isCaptain(player.id)}
              isDisabled={isDisabled(player.id)}
              disabledReason={getDisabledReason(player.id)}
              onSelect={() => onSelect(player.id)}
              size="sm"
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── PredictionsPanel ─────────────────────────────────────────────────────────

interface PredictionsPanelProps {
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  tournamentTeams: TournamentTeam[];
  squadPlayerIds: Set<string>;
  championTeamId: string | null;
  disappointmentTeamId: string | null;
  revelationTeamId: string | null;
  tournamentMvpId: string | null;
  setChampionTeamId: (id: string | null) => void;
  setDisappointmentTeamId: (id: string | null) => void;
  setRevelationTeamId: (id: string | null) => void;
  setTournamentMvpId: (id: string | null) => void;
  showRevelation?: boolean;
  leagueName?: string;
}

function PredictionsPanel({
  players,
  nationalTeams,
  tournamentTeams,
  squadPlayerIds,
  championTeamId,
  disappointmentTeamId,
  revelationTeamId,
  tournamentMvpId,
  setChampionTeamId,
  setDisappointmentTeamId,
  setRevelationTeamId,
  setTournamentMvpId,
  showRevelation = true,
  leagueName,
}: PredictionsPanelProps) {
  const revelationTeams = getEligibleRevelationTeams(tournamentTeams);
  const disappointmentTeams = getEligibleDisappointmentTeams(tournamentTeams);

  const availableChampion = nationalTeams.filter(
    (t) =>
      t.id === championTeamId ||
      (t.id !== disappointmentTeamId && t.id !== revelationTeamId),
  );
  const availableDisappointment = disappointmentTeams.filter(
    (t) =>
      t.id === disappointmentTeamId ||
      (t.id !== championTeamId && t.id !== revelationTeamId),
  );
  const availableRevelation = revelationTeams.filter(
    (t) =>
      t.id === revelationTeamId ||
      (t.id !== championTeamId && t.id !== disappointmentTeamId),
  );

  const championTeam = championTeamId
    ? nationalTeams.find((t) => t.id === championTeamId)
    : undefined;
  const mvpPlayer = tournamentMvpId
    ? players.find((p) => p.id === tournamentMvpId)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      {leagueName && (
        <p className="rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/30 px-3 py-2 text-xs text-[var(--muted)]">
          Predicciones para <strong>{leagueName}</strong>. La revelación solo se configura en tu equipo global.
        </p>
      )}
      <p className="text-xs text-[var(--muted)]">
        Campeón y MVP son predicciones clásicas. Decepción (cuota ≤ {DISAPPOINTMENT_MAX_ODDS})
        {showRevelation
          ? ` y revelación (tapada, cuota ≥ ${REVELATION_MIN_ODDS}) usan las cuotas del torneo.`
          : " usa las cuotas del torneo."}
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-2 text-sm font-medium">🏆 Campeón del torneo</p>
        {championTeam ? (
          <NationalTeamHeroBanner
            team={championTeam}
            subtitle={
              championTeam.odds !== undefined
                ? `Cuota x${championTeam.odds.toFixed(1)}`
                : undefined
            }
            onClear={() => setChampionTeamId(null)}
          />
        ) : (
          <NationalTeamPickerSelect
            name="builder-champion"
            teams={availableChampion}
            value={championTeamId ?? ""}
            onChange={(id) => setChampionTeamId(id || null)}
            placeholder="Elige campeón…"
          />
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-2 text-sm font-medium">🌟 MVP del torneo</p>
        {mvpPlayer ? (
          <FantasyMvpHeroBanner player={mvpPlayer} onClear={() => setTournamentMvpId(null)} />
        ) : (
          <FantasyPlayerSearchPicker
            players={players}
            nationalTeams={nationalTeams}
            value={tournamentMvpId}
            onChange={setTournamentMvpId}
            restrictToPlayerIds={squadPlayerIds}
            hint="Elige un jugador de tu plantilla (15 jugadores)."
            placeholder="Buscar en tu plantilla…"
          />
        )}
      </div>

      <div className="rounded-2xl border border-rose-200 bg-[var(--surface)] p-4 dark:border-rose-800">
        <p className="mb-1 text-sm font-medium">💣 Selección decepción</p>
        <p className="mb-2 text-xs text-[var(--muted)]">Favorita que crees que no cumplirá (cuota ≤ {DISAPPOINTMENT_MAX_ODDS}).</p>
        <PredictionTournamentTeamPicker
          selectName="builder-disappointment"
          options={availableDisappointment}
          value={disappointmentTeamId ?? ""}
          onChange={(id) => setDisappointmentTeamId(id || null)}
          placeholder="Elige decepción…"
          formatOdds={formatOdds}
        />
      </div>

      {showRevelation && (
        <div className="rounded-2xl border-2 border-amber-300 bg-[var(--surface)] p-4 dark:border-amber-700">
          <p className="mb-1 text-sm font-semibold">⭐ Selección revelación / tapada</p>
          <p className="mb-2 text-xs text-[var(--muted)]">
            Underdog que puede sorprender. Solo equipos con cuota ≥ {REVELATION_MIN_ODDS}.
          </p>
          <PredictionTournamentTeamPicker
            selectName="builder-revelation"
            options={availableRevelation}
            value={revelationTeamId ?? ""}
            onChange={(id) => setRevelationTeamId(id || null)}
            placeholder="Elige tu tapada…"
            formatOdds={formatOdds}
          />
        </div>
      )}
    </div>
  );
}

// ─── ConfirmationPanel ────────────────────────────────────────────────────────

interface ConfirmationPanelProps {
  teamName: string;
  goalkeeperId: string | null;
  defenderIds: string[];
  midfielderIds: string[];
  forwardIds: string[];
  bench: Partial<FantasyBench>;
  captainId: string | null;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  tournamentTeams: TournamentTeam[];
  championTeamId?: string | null;
  revelationTeamId?: string | null;
  disappointmentTeamId?: string | null;
  tournamentMvpId?: string | null;
}

function ConfirmationPanel({
  teamName,
  goalkeeperId,
  defenderIds,
  midfielderIds,
  forwardIds,
  bench,
  captainId,
  players,
  nationalTeams,
  tournamentTeams,
  championTeamId,
  revelationTeamId,
  disappointmentTeamId,
  tournamentMvpId,
}: ConfirmationPanelProps) {
  const pm = new Map(players.map((p) => [p.id, p]));
  const ntm = new Map(nationalTeams.map((t) => [t.id, t]));
  const ttm = new Map(tournamentTeams.map((t) => [t.id, t]));

  const starterGroups = [
    {
      label: "Portero",
      ids: goalkeeperId ? [goalkeeperId] : [],
    },
    { label: "Defensas", ids: defenderIds },
    { label: "Centrocampistas", ids: midfielderIds },
    { label: "Delanteros", ids: forwardIds },
  ];

  const benchGroups = [
    { label: "POR", id: bench.goalkeeperId },
    { label: "DEF", id: bench.defenderId },
    { label: "CEN", id: bench.midfielderId },
    { label: "DEL", id: bench.forwardId },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">{teamName}</h2>
        <p className="text-sm text-[var(--muted)]">Mundial 2026 · World Cup Fantasy</p>
      </div>

      {/* Starters */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-3 text-sm font-medium">Once titular</p>
        <div className="flex flex-col gap-1.5">
          {starterGroups.map(({ label, ids }) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                {label}
              </p>
              {ids.map((id) => {
                const p = pm.get(id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <PlayerAvatar player={p} size={28} priority />
                    <span className="truncate">{p.name}</span>
                    {id === captainId && <span className="text-xs">⭐ Capitán</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-2 text-sm font-medium">Banquillo</p>
        <div className="flex flex-wrap gap-2">
          {benchGroups.map(({ label, id }) => {
            const p = id ? pm.get(id) : undefined;
            return (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-2 py-1 text-xs"
              >
                {p ? <PlayerAvatar player={p} size={20} /> : <span className="text-[var(--muted)]">{label}</span>}
                <span>{p?.name ?? "—"}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Predictions Summary */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Predicciones del torneo
        </p>
        <div
          className={`grid grid-cols-2 gap-3 ${
            revelationTeamId != null ? "sm:grid-cols-4" : "sm:grid-cols-3"
          }`}
        >
          <PredictionSummaryNationalTile
            label="Campeona"
            team={championTeamId ? ntm.get(championTeamId) : null}
            teamId={championTeamId ?? undefined}
          />
          {revelationTeamId != null && (
            <PredictionSummaryNationalTile
              label="Revelación"
              team={
                revelationTeamId
                  ? {
                      id: revelationTeamId,
                      name: ttm.get(revelationTeamId)?.name ?? revelationTeamId,
                      logoUrl: ttm.get(revelationTeamId)?.crestUrl,
                    }
                  : null
              }
              teamId={revelationTeamId ?? undefined}
            />
          )}
          <PredictionSummaryNationalTile
            label="Decepción"
            team={
              disappointmentTeamId
                ? {
                    id: disappointmentTeamId,
                    name: ttm.get(disappointmentTeamId)?.name ?? disappointmentTeamId,
                    logoUrl: ttm.get(disappointmentTeamId)?.crestUrl,
                  }
                : null
            }
            teamId={disappointmentTeamId ?? undefined}
          />
          <PredictionSummaryMvpTile
            player={tournamentMvpId ? pm.get(tournamentMvpId) : null}
          />
        </div>
      </div>
    </div>
  );
}
