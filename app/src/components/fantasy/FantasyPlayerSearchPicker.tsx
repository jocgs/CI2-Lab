"use client";

import { useMemo, useState } from "react";
import type { FantasyNationalTeam, FantasyPlayer, Position } from "@/types/fantasy";
import { FantasyPlayerCard } from "@/components/fantasy/FantasyPlayerCard";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { clsx } from "@/lib/utils";

const POS_LABELS: Record<Position, string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FWD: "Delantero",
};

const ALL_POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

interface Props {
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  value: string | null;
  onChange: (playerId: string | null) => void;
  disabled?: boolean;
  /** Si se define, solo se listan jugadores de este pool (p. ej. plantilla). */
  restrictToPlayerIds?: Set<string>;
  placeholder?: string;
  hint?: string;
  maxHeightClass?: string;
}

export function FantasyPlayerSearchPicker({
  players = [],
  nationalTeams,
  value,
  onChange,
  disabled = false,
  restrictToPlayerIds,
  placeholder = "Buscar por nombre…",
  hint,
  maxHeightClass = "max-h-64",
}: Props) {
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterPosition, setFilterPosition] = useState<Position | "all">("all");

  const selected = players.find((p) => p.id === value);

  const filtered = useMemo(() => {
    let pool = players;
    if (restrictToPlayerIds) {
      pool = pool.filter((p) => restrictToPlayerIds.has(p.id));
    }
    if (filterPosition !== "all") {
      pool = pool.filter((p) => p.position === filterPosition);
    }
    if (filterTeam !== "all") {
      pool = pool.filter((p) => p.nationalTeamId === filterTeam);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      pool = pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nationalTeamName.toLowerCase().includes(q),
      );
    }
    return pool.slice(0, 80);
  }, [players, restrictToPlayerIds, filterPosition, filterTeam, search]);

  const teamOptions = useMemo(() => {
    const ids = new Set(
      (restrictToPlayerIds
        ? players.filter((p) => restrictToPlayerIds.has(p.id))
        : players
      ).map((p) => p.nationalTeamId),
    );
    return nationalTeams
      .filter((t) => ids.has(t.id))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [players, nationalTeams, restrictToPlayerIds]);

  return (
    <div className="flex flex-col gap-2">
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}

      {selected && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--brand)]/30 bg-[var(--brand-soft)]/40 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <PlayerAvatar player={selected} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selected.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {POS_LABELS[selected.position]} · {selected.nationalTeamName}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cambiar
            </button>
          )}
        </div>
      )}

      {!disabled && !selected && (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            >
              <option value="all">Todos los países</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={filterPosition}
              onChange={(e) =>
                setFilterPosition(e.target.value as Position | "all")
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            >
              <option value="all">Todas las posiciones</option>
              {ALL_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {POS_LABELS[pos]}
                </option>
              ))}
            </select>
          </div>

          <div
            className={clsx(
              "flex flex-col gap-1.5 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-2",
              maxHeightClass,
            )}
          >
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">
                No hay jugadores con esos filtros
              </p>
            ) : (
              filtered.map((player) => (
                <FantasyPlayerCard
                  key={player.id}
                  player={player}
                  isSelected={value === player.id}
                  isCaptain={false}
                  isDisabled={false}
                  onSelect={() => onChange(player.id)}
                  size="sm"
                />
              ))
            )}
            {filtered.length === 80 && (
              <p className="py-1 text-center text-[10px] text-[var(--muted)]">
                Mostrando los primeros 80 resultados. Afina la búsqueda.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
