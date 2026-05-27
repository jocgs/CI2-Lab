"use client";

import { useState, useTransition } from "react";
import type { FantasyPlayer, Position } from "@/types/fantasy";
import { SectionTitle } from "@/components/ui";
import {
  adminAddStatsAction,
  adminLockTeamsAction,
  adminRecalculateAction,
} from "./admin-actions";

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LABELS: Record<Position, string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FWD: "Delantero",
};

interface Props {
  players: FantasyPlayer[];
}

export function FantasyAdminClient({ players }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Add stats form
  const [playerId, setPlayerId] = useState("");
  const [matchId, setMatchId] = useState("match_001");
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [cleanSheet, setCleanSheet] = useState(false);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);
  const [penaltySaved, setPenaltySaved] = useState(0);
  const [penaltyMissed, setPenaltyMissed] = useState(0);
  const [mvp, setMvp] = useState(false);
  const [minutesPlayed, setMinutesPlayed] = useState(90);
  const [filterPos, setFilterPos] = useState<Position | "ALL">("ALL");
  const [search, setSearch] = useState("");

  function handleAddStats() {
    if (!playerId) { setMessage("⚠️ Selecciona un jugador."); return; }
    startTransition(async () => {
      const result = await adminAddStatsAction({
        playerId,
        matchId,
        goals,
        assists,
        cleanSheet,
        yellowCards,
        redCards,
        penaltySaved,
        penaltyMissed,
        mvp,
        minutesPlayed,
      });
      setMessage(result.error ? `⚠️ ${result.error}` : "✅ Stats añadidas correctamente. Ranking recalculado.");
    });
  }

  function handleLockTeams() {
    startTransition(async () => {
      const result = await adminLockTeamsAction("world_cup_2026");
      setMessage(result.error ? `⚠️ ${result.error}` : "🔒 Equipos bloqueados.");
    });
  }

  function handleRecalculate() {
    startTransition(async () => {
      const result = await adminRecalculateAction("world_cup_2026");
      setMessage(result.error ? `⚠️ ${result.error}` : "♻️ Ranking recalculado correctamente.");
    });
  }

  const filteredPlayers = players
    .filter((p) => filterPos === "ALL" || p.position === filterPos)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-8">
      {message && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick actions */}
      <section>
        <SectionTitle
          title="Acciones rápidas"
          subtitle="Para cuando los árbitros ya pitaron el final"
        />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLockTeams}
            disabled={isPending}
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-40"
          >
            🔒 Bloquear equipos del Mundial
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isPending}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--background)] disabled:opacity-40"
          >
            ♻️ Recalcular ranking
          </button>
        </div>
      </section>

      {/* Add stats */}
      <section>
        <SectionTitle
          title="Añadir estadísticas de partido"
          subtitle="Introduce los datos de un jugador en un partido específico"
        />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Player selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                Jugador
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar jugador..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                  />
                  <select
                    value={filterPos}
                    onChange={(e) => setFilterPos(e.target.value as Position | "ALL")}
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <option value="ALL">Todas posiciones</option>
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {POSITION_LABELS[pos]}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                  size={6}
                >
                  <option value="">-- Selecciona jugador --</option>
                  {filteredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.position}] {p.name} · {p.nationalTeamName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">ID del partido</label>
              <input
                type="text"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>

            <NumberInput label="Minutos jugados" value={minutesPlayed} onChange={setMinutesPlayed} min={0} max={120} />
            <NumberInput label="Goles" value={goals} onChange={setGoals} min={0} max={10} />
            <NumberInput label="Asistencias" value={assists} onChange={setAssists} min={0} max={10} />
            <NumberInput label="Tarjetas amarillas" value={yellowCards} onChange={setYellowCards} min={0} max={2} />
            <NumberInput label="Tarjeta roja" value={redCards} onChange={setRedCards} min={0} max={1} />
            <NumberInput label="Penaltis parados" value={penaltySaved} onChange={setPenaltySaved} min={0} max={5} />
            <NumberInput label="Penaltis fallados" value={penaltyMissed} onChange={setPenaltyMissed} min={0} max={5} />

            <div className="flex items-center gap-6 sm:col-span-2">
              <Checkbox label="Portería a cero" checked={cleanSheet} onChange={setCleanSheet} />
              <Checkbox label="MVP del partido" checked={mvp} onChange={setMvp} />
            </div>
          </div>

          <button
            onClick={handleAddStats}
            disabled={isPending || !playerId}
            className="mt-4 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:opacity-90"
          >
            {isPending ? "Guardando..." : "Añadir estadísticas"}
          </button>
        </div>
      </section>

      {/* Players table */}
      <section>
        <SectionTitle
          title={`Jugadores (${filteredPlayers.length})`}
          subtitle="Lista completa · filtra arriba para encontrar rápido"
        />
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-3 py-2">Pos.</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2 hidden sm:table-cell">Selección</th>
                <th className="px-3 py-2 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => setPlayerId(p.id)}
                  className={`cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors ${
                    p.id === playerId
                      ? "bg-[var(--brand-soft)]"
                      : i % 2 === 0
                      ? "bg-[var(--surface)] hover:bg-[var(--brand-soft)]"
                      : "bg-[var(--background)] hover:bg-[var(--brand-soft)]"
                  }`}
                >
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-[var(--border)] px-1.5 py-0.5 text-xs font-medium">
                      {p.position}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-[var(--muted)] hidden sm:table-cell">{p.nationalTeamName}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.totalFantasyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--muted)] mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[var(--brand)]"
      />
      {label}
    </label>
  );
}
