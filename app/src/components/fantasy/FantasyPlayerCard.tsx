"use client";

import type { FantasyPlayer } from "@/types/fantasy";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { clsx } from "@/lib/utils";

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
    <button
      type="button"
      onClick={isDisabled ? undefined : onSelect}
      title={isDisabled ? disabledReason : undefined}
      aria-pressed={isSelected}
      disabled={isDisabled}
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
        <PlayerAvatar player={player} size={isSmall ? 36 : 44} />

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
      </div>
    </button>
  );
}
