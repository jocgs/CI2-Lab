import type { NationalTeamCrestTeam } from "@/components/fantasy/NationalTeamCrest";
import { NationalTeamCrestImage } from "@/components/fantasy/NationalTeamCrestImage";
import { getNationalTeamCrestUrl } from "@/lib/national-team-crests";
import { clsx } from "@/lib/utils";

interface NationalTeamHeroBannerProps {
  team: NationalTeamCrestTeam;
  subtitle?: string;
  className?: string;
  onClear?: () => void;
  clearLabel?: string;
}

export function NationalTeamHeroBanner({
  team,
  subtitle,
  className,
  onClear,
  clearLabel = "Cambiar",
}: NationalTeamHeroBannerProps) {
  const src = team.logoUrl ?? getNationalTeamCrestUrl(team.id);

  return (
    <div
      className={clsx(
        "relative h-36 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--background)] to-[var(--brand-soft)]/20" />

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <NationalTeamCrestImage
          teamId={team.id}
          teamName={team.name}
          src={src}
          priority
          imgClassName="max-h-full max-w-full drop-shadow-lg"
          fallbackClassName="text-4xl"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-10">
        <p className="truncate text-base font-semibold text-white">{team.name}</p>
        {subtitle && (
          <p className="truncate text-xs text-white/85">{subtitle}</p>
        )}
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-2 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm hover:bg-black/55"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
