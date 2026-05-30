"use client";

import { useEffect, useState } from "react";
import {
  getNationalTeamCrestUrl,
  getNationalTeamInitials,
} from "@/lib/national-team-crests";
import { getNationalTeamFlagEmoji } from "@/lib/national-team-flags";
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
  priority?: boolean;
}

export function NationalTeamCrest({
  team,
  size = 24,
  className,
  title,
  priority = false,
}: NationalTeamCrestProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [team?.id, team?.logoUrl]);

  if (!team) return null;

  const src = team.logoUrl ?? getNationalTeamCrestUrl(team.id);
  const label = title ?? team.name;
  const emoji = getNationalTeamFlagEmoji(team.id);
  const fontSize = Math.max(8, Math.round(size * 0.55));

  if (!src || imageFailed) {
    return (
      <span
        title={label}
        aria-label={label}
        className={clsx(
          "inline-flex flex-shrink-0 items-center justify-center leading-none",
          className,
        )}
        style={{ width: size, height: size, fontSize }}
      >
        {emoji !== "🏳️" ? emoji : getNationalTeamInitials(team.name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      title={label}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setImageFailed(true)}
      className={clsx("object-contain flex-shrink-0", className)}
    />
  );
}
