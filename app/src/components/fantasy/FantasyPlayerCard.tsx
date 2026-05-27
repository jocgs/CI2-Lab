"use client";

import type { FantasyPlayer, Position } from "@/types/fantasy";
import { clsx } from "@/lib/utils";

const POSITION_STYLES: Record<Position, string> = {
  GK: "bg-amber-100 text-amber-700",
  DEF: "bg-blue-100 text-blue-700",
  MID: "bg-green-100 text-green-700",
  FWD: "bg-red-100 text-red-700",
};

const POSITION_LABELS: Record<Position, string> = {
  GK: "POR",
  DEF: "DEF",
  MID: "CEN",
  FWD: "DEL",
};

interface FantasyPlayerCardProps {
  player: FantasyPlayer;
  isSelected?: boolean;
  isCaptain?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  onSelect?: () => void;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function FantasyPlayerCard({
  player,
  isSelected = false,
  isCaptain = false,
  isDisabled = false,
  disabledReason,
  onSelect,
  onRemove,
  size = "md",
}: FantasyPlayerCardProps) {
  const isSmall = size === "sm";

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      title={isDisabled ? disabledReason : undefined}
      className={clsx(
        "relative rounded-xl border transition-all",
        isSmall ? "p-2" : "p-3",
        isDisabled
          ? "cursor-not-allowed border-[var(--border)] bg-[var(--background)] opacity-40"
          : isSelected
            ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-md cursor-pointer"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:shadow-sm cursor-pointer",
      )}
    >
      {/* Captain badge */}
      {isCaptain && (
        <span className="absolute -top-2 -right-2 text-base leading-none" title="Capitán">
          ⭐
        </span>
      )}

      <div className="flex items-center gap-2">
        {/* Position badge */}
        <span
          className={clsx(
            "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold",
            POSITION_STYLES[player.position],
            isSmall ? "text-[10px]" : "text-xs",
          )}
        >
          {POSITION_LABELS[player.position]}
        </span>

        {/* Name + team */}
        <div className="min-w-0 flex-1">
          <p
            className={clsx(
              "truncate font-medium leading-tight",
              isSmall ? "text-xs" : "text-sm",
            )}
          >
            {player.name}
          </p>
          <p
            className={clsx(
              "truncate text-[var(--muted)]",
              isSmall ? "text-[10px]" : "text-xs",
            )}
          >
            {player.nationalTeamName}
          </p>
        </div>

        {/* Points */}
        {player.totalFantasyPoints > 0 && (
          <span
            className={clsx(
              "shrink-0 font-semibold tabular-nums text-[var(--brand-strong)]",
              isSmall ? "text-xs" : "text-sm",
            )}
          >
            {player.totalFantasyPoints}pts
          </span>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="shrink-0 rounded-full p-0.5 text-[var(--muted)] hover:bg-red-100 hover:text-red-600"
            aria-label={`Quitar a ${player.name}`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
