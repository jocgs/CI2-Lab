"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  FantasyPlayer,
  FantasyNationalTeam,
  Position,
  FantasyStartingEleven,
  FantasyBench,
} from "@/types/fantasy";
import { FantasyPlayerCard } from "@/components/fantasy/FantasyPlayerCard";
import { createFantasyTeamAction } from "./actions";
import { clsx } from "@/lib/utils";

// ─── Step hints ─────────────────────────────────────────────────────────────

const STEP_CONFIG = [
  {
    step: 1,
    title: "Nombre del equipo",
    hint: "Algo épico. O una ironía. Ambas valen.",
    position: null,
    count: null,
  },
  {
    step: 2,
    title: "Portero titular",
    hint: "El muro o el meme. Tú decides.",
    position: "GK" as Position,
    count: 1,
  },
  {
    step: 3,
    title: "4 Defensas titulares",
    hint: "Gente que sabe lo que es un fuera de juego (más o menos).",
    position: "DEF" as Position,
    count: 4,
  },
  {
    step: 4,
    title: "3 Centrocampistas titulares",
    hint: "Los que dan el pase de gol y nunca marcan.",
    position: "MID" as Position,
    count: 3,
  },
  {
    step: 5,
    title: "3 Delanteros titulares",
    hint: "Aquí van los que supuestamente meten goles.",
    position: "FWD" as Position,
    count: 3,
  },
  {
    step: 6,
    title: "4 Reservas (1 por posición)",
    hint: "Los que calientan el banquillo y te salvan un día.",
    position: null,
    count: 4,
  },
  {
    step: 7,
    title: "Elige tu capitán",
    hint: "El que lleva el brazalete y los puntos al doble.",
    position: null,
    count: 1,
  },
  {
    step: 8,
    title: "Confirmación",
    hint: "Última oportunidad para arrepentirte.",
    position: null,
    count: null,
  },
];

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
  competitionId: string;
}

export function FantasyBuilderClient({ players, nationalTeams, competitionId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Wizard state ──
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // ── Form data ──
  const [teamName, setTeamName] = useState("");
  const [goalkeeperId, setGoalkeeperId] = useState<string | null>(null);
  const [defenderIds, setDefenderIds] = useState<string[]>([]);
  const [midfielderIds, setMidfielderIds] = useState<string[]>([]);
  const [forwardIds, setForwardIds] = useState<string[]>([]);
  const [bench, setBench] = useState<Partial<FantasyBench>>({});
  const [captainId, setCaptainId] = useState<string | null>(null);

  // ── Filter state ──
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [search, setSearch] = useState("");

  const config = STEP_CONFIG[step - 1];

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
    if (alreadySelected) return false; // puede deseleccionarse siempre
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

    if (step === 6) {
      // Bench step — show all positions but only non-starters
      pool = pool.filter((p) => !allStarterIds.includes(p.id));
    }

    if (step === 7) {
      // Captain step — only starters
      pool = players.filter((p) => allStarterIds.includes(p.id));
    }

    if (step === 8) {
      // Predictions step — handled separately
      return [];
    }

    if (filterTeam !== "all") {
      pool = pool.filter((p) => p.nationalTeamId === filterTeam);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter((p) => p.name.toLowerCase().includes(q));
    }

    return pool;
  }, [players, config.position, step, filterTeam, search, allStarterIds]);

  // ─── Step validation ──────────────────────────────────────────────────────
  const canAdvance = useMemo(() => {
    if (step === 1) return teamName.trim().length > 0;
    if (step === 2) return !!goalkeeperId;
    if (step === 3) return defenderIds.length === 4;
    if (step === 4) return midfielderIds.length === 3;
    if (step === 5) return forwardIds.length === 3;
    if (step === 6)
      return !!(bench.goalkeeperId && bench.defenderId && bench.midfielderId && bench.forwardId);
    if (step === 7) return !!captainId;
    return true;
  }, [step, teamName, goalkeeperId, defenderIds, midfielderIds, forwardIds, bench, captainId]);

  // ─── Bench step — current position being selected ────────────────────────
  const [benchPositionIndex, setBenchPositionIndex] = useState(0);
  const currentBenchPosition = BENCH_POSITIONS[benchPositionIndex];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handlePlayerSelect(playerId: string) {
    setError(null);
    // Bloquear si el jugador superaría el cupo de 3 por selección
    if (isPlayerDisabled(playerId)) {
      const player = players.find((p) => p.id === playerId);
      setError(
        `Máximo 3 jugadores de ${player?.nationalTeamName ?? "la misma selección"}. Esto no es poner a Francia entera.`,
      );
      return;
    }
    if (step === 2) {
      setGoalkeeperId(goalkeeperId === playerId ? null : playerId);
    } else if (step === 3) {
      if (defenderIds.includes(playerId)) {
        setDefenderIds(defenderIds.filter((id) => id !== playerId));
      } else if (defenderIds.length < 4) {
        setDefenderIds([...defenderIds, playerId]);
      }
    } else if (step === 4) {
      if (midfielderIds.includes(playerId)) {
        setMidfielderIds(midfielderIds.filter((id) => id !== playerId));
      } else if (midfielderIds.length < 3) {
        setMidfielderIds([...midfielderIds, playerId]);
      }
    } else if (step === 5) {
      if (forwardIds.includes(playerId)) {
        setForwardIds(forwardIds.filter((id) => id !== playerId));
      } else if (forwardIds.length < 3) {
        setForwardIds([...forwardIds, playerId]);
      }
    } else if (step === 6) {
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
      // Auto-advance bench position
      const nextIdx = BENCH_POSITIONS.findIndex(
        (p, i) => i > benchPositionIndex && !bench[keyMap[p]],
      );
      if (nextIdx !== -1) setBenchPositionIndex(nextIdx);
    } else if (step === 7) {
      setCaptainId(captainId === playerId ? null : playerId);
    }
  }

  function isPlayerSelected(playerId: string): boolean {
    if (step === 2) return goalkeeperId === playerId;
    if (step === 3) return defenderIds.includes(playerId);
    if (step === 4) return midfielderIds.includes(playerId);
    if (step === 5) return forwardIds.includes(playerId);
    if (step === 6) return allBenchIds.includes(playerId);
    if (step === 7) return captainId === playerId;
    return false;
  }

  function handleSubmit() {
    if (!goalkeeperId) { setError("Falta el portero."); return; }
    if (defenderIds.length !== 4) { setError("Faltan defensas."); return; }
    if (midfielderIds.length !== 3) { setError("Faltan centrocampistas."); return; }
    if (forwardIds.length !== 3) { setError("Faltan delanteros."); return; }
    if (!bench.goalkeeperId || !bench.defenderId || !bench.midfielderId || !bench.forwardId) {
      setError("Banquillo incompleto."); return;
    }
    if (!captainId) { setError("Falta el capitán."); return; }

    const startingEleven: FantasyStartingEleven = {
      goalkeeperId,
      defenderIds: defenderIds as [string, string, string, string],
      midfielderIds: midfielderIds as [string, string, string],
      forwardIds: forwardIds as [string, string, string],
    };
    const fullBench: FantasyBench = {
      goalkeeperId: bench.goalkeeperId!,
      defenderId: bench.defenderId!,
      midfielderId: bench.midfielderId!,
      forwardId: bench.forwardId!,
    };

    startTransition(async () => {
      const result = await createFantasyTeamAction({
        competitionId,
        teamName,
        startingEleven,
        bench: fullBench,
        captainId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/fantasy/my-team");
      }
    });
  }

  const pm = new Map(players.map((p) => [p.id, p]));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{config.title}</span>
          <span className="text-[var(--muted)]">Paso {step} de 8</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)]">
          <div
            className="h-2 rounded-full bg-[var(--brand)] transition-all"
            style={{ width: `${(step / 8) * 100}%` }}
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

      {/* ── STEPS 2-5: Starter selection ── */}
      {step >= 2 && step <= 5 && (
        <PlayerPickerPanel
          players={filteredPlayers}
          allPlayers={players}
          nationalTeams={nationalTeams}
          onSelect={handlePlayerSelect}
          isSelected={isPlayerSelected}
          isCaptain={(id) => captainId === id}
          isDisabled={isPlayerDisabled}
          getDisabledReason={disabledReason}
          teamCountMap={teamCountMap}
          filterTeam={filterTeam}
          setFilterTeam={setFilterTeam}
          search={search}
          setSearch={setSearch}
          selectedCount={
            step === 2 ? (goalkeeperId ? 1 : 0)
            : step === 3 ? defenderIds.length
            : step === 4 ? midfielderIds.length
            : forwardIds.length
          }
          maxCount={config.count ?? 1}
          label={config.title}
        />
      )}

      {/* ── STEP 6: Bench ── */}
      {step === 6 && (
        <div className="flex flex-col gap-3">
          {/* Current bench */}
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
                    <p className="font-semibold">{POS_LABELS[pos].slice(0, 3)}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                      {player ? player.name.split(" ").slice(-1)[0] : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Seleccionando: <strong>{POS_LABELS[currentBenchPosition]}</strong>
            </p>
          </div>

          <PlayerPickerPanel
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
            search={search}
            setSearch={setSearch}
            selectedCount={allBenchIds.length}
            maxCount={4}
            label={`Reserva ${POS_LABELS[currentBenchPosition]}`}
          />
        </div>
      )}

      {/* ── STEP 7: Captain ── */}
      {step === 7 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm text-[var(--muted)]">
              El capitán recibe el <strong>doble de puntos</strong> (si son positivos).
              Elige sabiamente — o no.
            </p>
          </div>
          <PlayerPickerPanel
            players={filteredPlayers}
            allPlayers={players}
            nationalTeams={nationalTeams}
            onSelect={handlePlayerSelect}
            isSelected={isPlayerSelected}
            isCaptain={(id) => captainId === id}
            isDisabled={() => false}
            getDisabledReason={() => undefined}
            teamCountMap={teamCountMap}
            filterTeam={filterTeam}
            setFilterTeam={setFilterTeam}
            search={search}
            setSearch={setSearch}
            selectedCount={captainId ? 1 : 0}
            maxCount={1}
            label="Capitán"
          />
        </div>
      )}

      {/* ── STEP 8: Confirmation ── */}
      {step === 8 && (
        <ConfirmationPanel
          teamName={teamName}
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
        {step < 8 ? (
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
              if (step === 5) setBenchPositionIndex(0);
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
            {isPending ? "Guardando..." : "¡Crear equipo! 🚀"}
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
  search: string;
  setSearch: (s: string) => void;
  selectedCount: number;
  maxCount: number;
  label: string;
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
  search,
  setSearch,
  selectedCount,
  maxCount,
  label,
}: PlayerPickerPanelProps) {
  const presentTeamIds = new Set(players.map((p) => p.nationalTeamId));
  const relevantTeams = nationalTeams.filter((t) => presentTeamIds.has(t.id));

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
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugador..."
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        >
          <option value="all">Todas las selecciones</option>
          {relevantTeams.map((t) => {
            const count = teamCountMap.get(t.id) ?? 0;
            const full = count >= 3;
            return (
              <option key={t.id} value={t.id}>
                {t.flagUrl} {t.name}{full ? " (3/3 🔴)" : count > 0 ? ` (${count}/3)` : ""}
              </option>
            );
          })}
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
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    full
                      ? "bg-red-100 text-red-700"
                      : count === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[var(--brand-soft)] text-[var(--brand-strong)]",
                  )}
                >
                  {team.flagUrl} {team.name.split(" ")[0]} {count}/3{full ? " 🔴" : ""}
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

<<<<<<< HEAD
=======
// ─── PredictionsPanel ─────────────────────────────────────────────────────────

interface PredictionsPanelProps {
  nationalTeams: FantasyNationalTeam[];
  players: FantasyPlayer[];
  championTeamId: string | null;
  surpriseTeamId: string | null;
  disappointmentTeamId: string | null;
  tournamentMvpId: string | null;
  setChampionTeamId: (id: string) => void;
  setSurpriseTeamId: (id: string) => void;
  setDisappointmentTeamId: (id: string) => void;
  setTournamentMvpId: (id: string) => void;
}

function PredictionsPanel({
  nationalTeams,
  players,
  championTeamId,
  surpriseTeamId,
  disappointmentTeamId,
  tournamentMvpId,
  setChampionTeamId,
  setSurpriseTeamId,
  setDisappointmentTeamId,
  setTournamentMvpId,
}: PredictionsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <TeamPicker
        label="🏆 Equipo campeón"
        hint="El que levantará el trofeo. Apuesta con el corazón o con la cabeza."
        teams={nationalTeams}
        selected={championTeamId}
        onSelect={setChampionTeamId}
      />
      <TeamPicker
        label="🚀 Equipo sorpresa"
        hint="El que llegará más lejos de lo esperado. Hay que creer."
        teams={nationalTeams}
        selected={surpriseTeamId}
        onSelect={setSurpriseTeamId}
      />
      <TeamPicker
        label="😬 Equipo decepción"
        hint="El que decepcionará a sus fans. Con cariño."
        teams={nationalTeams}
        selected={disappointmentTeamId}
        onSelect={setDisappointmentTeamId}
      />

      {/* MVP */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-1 text-sm font-medium">⭐ MVP del torneo</p>
        <p className="mb-3 text-xs text-[var(--muted)]">
          El mejor jugador del Mundial. De tu equipo o del mundo.
        </p>
        <select
          value={tournamentMvpId ?? ""}
          onChange={(e) => setTournamentMvpId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        >
          <option value="">Elige un jugador...</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.nationalTeamName})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TeamPicker({
  label,
  hint,
  teams,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  teams: FantasyNationalTeam[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <p className="mb-3 text-xs text-[var(--muted)]">{hint}</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={clsx(
              "flex flex-col items-center gap-0.5 rounded-xl border p-2 text-xs transition-all",
              selected === t.id
                ? "border-[var(--brand)] bg-[var(--brand-soft)] font-medium text-[var(--brand-strong)]"
                : "border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]",
            )}
          >
            <NationalTeamSymbol team={t} />
            <span className="truncate w-full text-center text-[10px]">
              {t.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

>>>>>>> 5256bc7 (Cambios perfiles)
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
}: ConfirmationPanelProps) {
  const pm = new Map(players.map((p) => [p.id, p]));

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
                    <span>{p.name}</span>
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
                className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs"
              >
                {label}: {p?.name ?? "—"}
              </span>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-2 text-sm font-medium">Predicciones</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[var(--muted)]">Campeón: </span>
            {ntm.get(championTeamId ?? "") ? (
              <span className="inline-flex items-center gap-1">
                <NationalTeamSymbol team={ntm.get(championTeamId!)} />
                <span>{ntm.get(championTeamId!)?.name}</span>
              </span>
            ) : (
              "—"
            )}
          </div>
          <div>
            <span className="text-[var(--muted)]">Sorpresa: </span>
            {ntm.get(surpriseTeamId ?? "") ? (
              <span className="inline-flex items-center gap-1">
                <NationalTeamSymbol team={ntm.get(surpriseTeamId!)} />
                <span>{ntm.get(surpriseTeamId!)?.name}</span>
              </span>
            ) : (
              "—"
            )}
          </div>
          <div>
            <span className="text-[var(--muted)]">Decepción: </span>
            {ntm.get(disappointmentTeamId ?? "") ? (
              <span className="inline-flex items-center gap-1">
                <NationalTeamSymbol team={ntm.get(disappointmentTeamId!)} />
                <span>{ntm.get(disappointmentTeamId!)?.name}</span>
              </span>
            ) : (
              "—"
            )}
          </div>
          <div>
            <span className="text-[var(--muted)]">MVP: </span>
            {tournamentMvpId ? pm.get(tournamentMvpId)?.name ?? "—" : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function NationalTeamSymbol({ team }: { team: FantasyNationalTeam | undefined }) {
  if (!team) return null;

  if (team.logoUrl) {
    return <img src={team.logoUrl} alt={team.name} className="h-4 w-4 object-contain" />;
  }

  return <span className="text-base">{team.flagUrl}</span>;
}
