import Image from "next/image";
import {
  getNationalTeamCrestUrl,
  getNationalTeamInitials,
} from "@/lib/national-team-crests";
import { clsx } from "@/lib/utils";

export interface NationalTeamCrestTeam {
  id: string;
  name: string;
  logoUrl?: string;
}

interface NationalTeamCrestProps {
  team: NationalTeamCrestTeam | undefined | null;
  size?: number;
  className?: string;
  title?: string;
}

export function NationalTeamCrest({
  team,
  size = 24,
  className,
  title,
}: NationalTeamCrestProps) {
  if (!team) return null;

  const src = team.logoUrl ?? getNationalTeamCrestUrl(team.id);
  const label = title ?? team.name;

  if (src) {
    return (
      <Image
        src={src}
        alt={label}
        title={label}
        width={size}
        height={size}
        className={clsx("object-contain flex-shrink-0", className)}
        unoptimized
      />
    );
  }

  return (
    <span
      title={label}
      className={clsx(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--border)] font-bold text-[var(--muted)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.32)) }}
    >
      {getNationalTeamInitials(team.name)}
    </span>
  );
}
