import type { FantasyPlayer } from "@/types/fantasy";
import type { NationalTeamCrestTeam } from "@/components/fantasy/NationalTeamCrest";
import { getNationalTeamCrestUrl, getNationalTeamInitials } from "@/lib/national-team-crests";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";
import { clsx } from "@/lib/utils";

interface PredictionSummaryNationalTileProps {
  label: string;
  team?: NationalTeamCrestTeam | null;
  teamId?: string;
  teamName?: string;
  className?: string;
}

/** Etiqueta arriba + recuadro con el escudo ocupando todo el espacio. */
export function PredictionSummaryNationalTile({
  label,
  team,
  teamId,
  teamName,
  className,
}: PredictionSummaryNationalTileProps) {
  const resolved: NationalTeamCrestTeam | null = team
    ? team
    : teamId
      ? { id: teamId, name: teamName ?? teamId, logoUrl: getNationalTeamCrestUrl(teamId) }
      : null;

  const src = resolved?.logoUrl ?? (resolved ? getNationalTeamCrestUrl(resolved.id) : undefined);

  return (
    <div className={clsx("flex min-w-0 flex-col gap-1.5", className)}>
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--background)]">
        {src && resolved ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={resolved.name}
              title={resolved.name}
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>
        ) : resolved?.name ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <span className="text-center text-sm font-bold text-[var(--muted)]">
              {getNationalTeamInitials(resolved.name)}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl text-[var(--muted)]">
            —
          </div>
        )}
      </div>
    </div>
  );
}

interface PredictionSummaryMvpTileProps {
  label?: string;
  player?: FantasyPlayer | null;
  className?: string;
}

/** Etiqueta + foto del jugador y nombre. */
export function PredictionSummaryMvpTile({
  label = "MVP",
  player,
  className,
}: PredictionSummaryMvpTileProps) {
  return (
    <div className={clsx("flex min-w-0 flex-col gap-1.5", className)}>
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div className="relative flex aspect-[5/4] w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--brand-soft)]/40 via-[var(--surface)] to-[var(--background)]">
        {player ? (
          <>
            <div className="flex flex-1 items-center justify-center p-3 pb-1">
              <PlayerAvatar player={player} size={72} className="ring-2 ring-white/80 shadow-md" />
            </div>
            <div className="border-t border-[var(--border)]/60 bg-[var(--surface)]/90 px-2 py-2 text-center">
              <p className="truncate text-xs font-semibold leading-tight">{player.name}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-2xl text-[var(--muted)]">
            —
          </div>
        )}
      </div>
    </div>
  );
}
