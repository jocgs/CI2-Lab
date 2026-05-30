import type { FantasyPlayer } from "@/types/fantasy";
import type { NationalTeamCrestTeam } from "@/components/fantasy/NationalTeamCrest";
import { NationalTeamCrestImage } from "@/components/fantasy/NationalTeamCrestImage";
import { getNationalTeamCrestUrl } from "@/lib/national-team-crests";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { clsx } from "@/lib/utils";

interface PredictionSummaryNationalTileProps {
  label: string;
  team?: NationalTeamCrestTeam | null;
  teamId?: string;
  teamName?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

/** Etiqueta arriba + recuadro con el escudo ocupando todo el espacio. */
export function PredictionSummaryNationalTile({
  label,
  team,
  teamId,
  teamName,
  className,
  onClick,
  disabled = false,
  active = false,
}: PredictionSummaryNationalTileProps) {
  const resolved: NationalTeamCrestTeam | null = team
    ? team
    : teamId
      ? { id: teamId, name: teamName ?? teamId, logoUrl: getNationalTeamCrestUrl(teamId) }
      : null;

  const src = resolved?.logoUrl ?? (resolved ? getNationalTeamCrestUrl(resolved.id) : undefined);

  const content = (
    <>
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div
        className={clsx(
          "relative aspect-[5/4] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-[var(--surface)] to-[var(--background)] transition-all",
          active
            ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30"
            : "border-[var(--border)]",
          onClick && !disabled && "group-hover:border-[var(--brand)]/60",
        )}
      >
        {resolved ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <NationalTeamCrestImage
              teamId={resolved.id}
              teamName={resolved.name}
              src={src}
              priority
              imgClassName="max-h-full max-w-full drop-shadow-md"
              fallbackClassName="text-sm"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[var(--muted)]">
            <span className="text-2xl">—</span>
            {onClick && !disabled && (
              <span className="text-[9px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
                Elegir
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        title={disabled ? label : `${label} — clic para editar`}
        className={clsx(
          "group flex min-w-0 flex-col gap-1.5 text-left",
          disabled ? "cursor-default opacity-80" : "cursor-pointer",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={clsx("flex min-w-0 flex-col gap-1.5", className)}>{content}</div>;
}

interface PredictionSummaryMvpTileProps {
  label?: string;
  player?: FantasyPlayer | null;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

/** Etiqueta + foto del jugador y nombre. */
export function PredictionSummaryMvpTile({
  label = "MVP",
  player,
  className,
  onClick,
  disabled = false,
  active = false,
}: PredictionSummaryMvpTileProps) {
  const content = (
    <>
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div
        className={clsx(
          "relative flex aspect-[5/4] w-full flex-col overflow-hidden rounded-xl border bg-gradient-to-br from-[var(--brand-soft)]/40 via-[var(--surface)] to-[var(--background)] transition-all",
          active
            ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30"
            : "border-[var(--border)]",
          onClick && !disabled && "group-hover:border-[var(--brand)]/60",
        )}
      >
        {player ? (
          <>
            <div className="flex flex-1 items-center justify-center p-3 pb-1">
              <PlayerAvatar
                player={player}
                size={72}
                priority
                className="ring-2 ring-white/80 shadow-md"
              />
            </div>
            <div className="border-t border-[var(--border)]/60 bg-[var(--surface)]/90 px-2 py-2 text-center">
              <p className="truncate text-xs font-semibold leading-tight">{player.name}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-[var(--muted)]">
            <span className="text-2xl">—</span>
            {onClick && !disabled && (
              <span className="text-[9px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
                Elegir
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        title={disabled ? label : `${label} — clic para editar`}
        className={clsx(
          "group flex min-w-0 flex-col gap-1.5 text-left",
          disabled ? "cursor-default opacity-80" : "cursor-pointer",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={clsx("flex min-w-0 flex-col gap-1.5", className)}>{content}</div>;
}
