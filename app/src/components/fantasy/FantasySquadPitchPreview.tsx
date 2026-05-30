"use client";

import type {
  FantasyBench,
  FantasyNationalTeam,
  FantasyPlayer,
  Formation,
} from "@/types/fantasy";
import { getFormationLabel, getFormationRequirements } from "@/lib/fantasy-formations";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { NationalTeamCrest } from "@/components/fantasy/NationalTeamCrest";

function PitchSlot({
  player,
  isCaptain,
  nationalTeams,
  compact,
}: {
  player: FantasyPlayer | undefined;
  isCaptain?: boolean;
  nationalTeams: FantasyNationalTeam[];
  compact?: boolean;
}) {
  const nt = player ? nationalTeams.find((t) => t.id === player.nationalTeamId) : undefined;

  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`grid place-items-center rounded-full border-2 border-dashed border-white/40 bg-white/10 text-white/70 ${
            compact ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-xs"
          }`}
        >
          ?
        </div>
        <span className={`max-w-[76px] truncate text-center text-white/60 ${compact ? "text-[9px]" : "text-[10px]"}`}>
          —
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <PlayerAvatar player={player} size={compact ? 36 : 44} priority className="ring-2 ring-white/30" />
        {isCaptain && (
          <span className="absolute -top-1 -right-1 text-sm leading-none drop-shadow">⭐</span>
        )}
      </div>
      <span
        className={`max-w-[80px] truncate text-center font-medium leading-tight text-white drop-shadow-sm ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
        title={player.name}
      >
        {player.name}
      </span>
      {nt && <NationalTeamCrest team={nt} size={14} priority />}
    </div>
  );
}

function PitchRow({
  players,
  nationalTeams,
  captainId,
  role,
}: {
  players: Array<FantasyPlayer | undefined>;
  nationalTeams: FantasyNationalTeam[];
  captainId: string | null;
  role: "attack" | "midfield" | "defense";
}) {
  const count = players.length;
  const widthByCount: Record<number, string> = {
    1: "28%",
    2: role === "attack" ? "60%" : "68%",
    3: role === "attack" ? "78%" : "86%",
    4: role === "midfield" ? "94%" : "96%",
    5: "100%",
  };

  return (
    <div
      className="mx-auto grid gap-3"
      style={{
        width: widthByCount[count] ?? "100%",
        gridTemplateColumns: `repeat(${Math.max(count, 1)}, minmax(0, 1fr))`,
      }}
    >
      {players.map((player, index) => (
        <div key={player?.id ?? `slot-${index}`} className="flex justify-center">
          <PitchSlot
            player={player}
            isCaptain={player?.id === captainId}
            nationalTeams={nationalTeams}
          />
        </div>
      ))}
    </div>
  );
}

export interface FantasySquadPitchPreviewProps {
  formation: Formation;
  teamName?: string;
  goalkeeperId: string | null;
  defenderIds: string[];
  midfielderIds: string[];
  forwardIds: string[];
  bench?: Partial<FantasyBench>;
  captainId?: string | null;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  compact?: boolean;
  showBench?: boolean;
}

export function FantasySquadPitchPreview({
  formation,
  teamName,
  goalkeeperId,
  defenderIds,
  midfielderIds,
  forwardIds,
  bench,
  captainId = null,
  players,
  nationalTeams,
  compact = false,
  showBench = true,
}: FantasySquadPitchPreviewProps) {
  const pm = new Map(players.map((p) => [p.id, p]));
  const req = getFormationRequirements(formation);

  const slot = (id: string | null | undefined) => (id ? pm.get(id) : undefined);

  const defs = Array.from({ length: req.defenders }, (_, i) => slot(defenderIds[i]));
  const mids = Array.from({ length: req.midfielders }, (_, i) => slot(midfielderIds[i]));
  const fwds = Array.from({ length: req.forwards }, (_, i) => slot(forwardIds[i]));
  const gk = slot(goalkeeperId);

  const benchPlayers = bench
    ? [
        slot(bench.goalkeeperId),
        slot(bench.defenderId),
        slot(bench.midfielderId),
        slot(bench.forwardId),
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] bg-[var(--brand-soft)] px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            {teamName && (
              <p className="truncate font-semibold text-[var(--brand-strong)]">{teamName}</p>
            )}
            <p className="text-xs text-[var(--muted)]">
              Formación <span className="font-semibold text-[var(--foreground)]">{getFormationLabel(formation)}</span>
            </p>
          </div>
          <span className="rounded-full bg-[var(--brand)] px-2.5 py-0.5 text-xs font-bold text-white">
            {getFormationLabel(formation)}
          </span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-emerald-800 to-emerald-700 p-4">
        <div className="pointer-events-none absolute inset-4 rounded-lg border border-white/20" />
        <div className="relative flex flex-col gap-5 py-1">
          <PitchRow players={fwds} nationalTeams={nationalTeams} captainId={captainId} role="attack" />
          <PitchRow players={mids} nationalTeams={nationalTeams} captainId={captainId} role="midfield" />
          <PitchRow players={defs} nationalTeams={nationalTeams} captainId={captainId} role="defense" />
          <div className="flex justify-center">
            <PitchSlot player={gk} isCaptain={gk?.id === captainId} nationalTeams={nationalTeams} compact={compact} />
          </div>
        </div>
      </div>

      {showBench && bench && (
        <div className="border-t border-[var(--border)] px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Banquillo
          </p>
          <div className="flex justify-around gap-2">
            {benchPlayers.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {p ? (
                  <>
                    <PlayerAvatar player={p} size={32} priority />
                    <span className="max-w-[64px] truncate text-[10px] font-medium">{p.name}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-[var(--muted)]">—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
