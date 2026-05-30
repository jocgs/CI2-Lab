"use client";

import type { FantasyNationalTeam, FantasyPlayer } from "@/types/fantasy";
import { FantasyPlayerSearchPicker } from "@/components/fantasy/FantasyPlayerSearchPicker";
import { FantasyMvpHeroBanner } from "@/components/fantasy/FantasyMvpHeroBanner";

interface BolaDeCristalPlayerAwardFieldProps {
  label: string;
  title: string;
  hint: string;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  value: string;
  onChange: (playerId: string) => void;
  disabled?: boolean;
  filterPosition?: FantasyPlayer["position"];
  placeholder?: string;
}

export function BolaDeCristalPlayerAwardField({
  label,
  title,
  hint,
  players,
  nationalTeams,
  value,
  onChange,
  disabled,
  filterPosition,
  placeholder = "Buscar jugador…",
}: BolaDeCristalPlayerAwardFieldProps) {
  const pool = filterPosition
    ? players.filter((p) => p.position === filterPosition)
    : players;

  const selected = value ? pool.find((p) => p.id === value) ?? players.find((p) => p.id === value) : undefined;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <p className="mb-2 text-xs text-[var(--muted)]">{hint}</p>
      {selected ? (
        <FantasyMvpHeroBanner
          player={selected}
          title={title}
          onClear={disabled ? undefined : () => onChange("")}
        />
      ) : (
        <FantasyPlayerSearchPicker
          players={pool}
          nationalTeams={nationalTeams}
          value={value || null}
          onChange={(id) => onChange(id ?? "")}
          disabled={disabled}
          placeholder={placeholder}
          hint={
            filterPosition === "GK"
              ? "Solo porteros del catálogo del Mundial."
              : "Cualquier jugador del catálogo del Mundial."
          }
        />
      )}
    </div>
  );
}
