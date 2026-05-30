import type { FantasyPlayer } from "@/types/fantasy";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { clsx } from "@/lib/utils";

const POS_LABELS: Record<FantasyPlayer["position"], string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FWD: "Delantero",
};

interface FantasyMvpHeroBannerProps {
  player: FantasyPlayer;
  className?: string;
  onClear?: () => void;
  clearLabel?: string;
}

export function FantasyMvpHeroBanner({
  player,
  className,
  onClear,
  clearLabel = "Cambiar",
}: FantasyMvpHeroBannerProps) {
  return (
    <div
      className={clsx(
        "relative flex h-40 w-full overflow-hidden rounded-2xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand-soft)]/50 via-[var(--surface)] to-[var(--background)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-end gap-1 p-4 pr-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand-strong)]">
          MVP del torneo
        </p>
        <p className="truncate text-xl font-semibold leading-tight">{player.name}</p>
        <p className="text-sm text-[var(--muted)]">
          {POS_LABELS[player.position]} · {player.nationalTeamName}
        </p>
      </div>

      <div className="relative flex w-[42%] max-w-[9.5rem] shrink-0 items-end justify-center bg-gradient-to-l from-[var(--brand)]/10 to-transparent p-3">
        <PlayerAvatar player={player} size={112} priority className="ring-4 ring-white/80 shadow-lg" />
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--muted)] backdrop-blur-sm hover:text-[var(--foreground)]"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
