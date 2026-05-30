"use client";

import { useEffect, useState } from "react";
import {
  getNationalTeamCrestUrl,
  getNationalTeamInitials,
} from "@/lib/national-team-crests";
import { getNationalTeamFlagEmoji } from "@/lib/national-team-flags";
import { clsx } from "@/lib/utils";

interface NationalTeamCrestImageProps {
  teamId: string;
  teamName: string;
  src?: string;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
  priority?: boolean;
}

/** Escudo grande con fallback a emoji de bandera si el PNG no está cacheado. */
export function NationalTeamCrestImage({
  teamId,
  teamName,
  src,
  className,
  fallbackClassName,
  imgClassName,
  priority = false,
}: NationalTeamCrestImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = src ?? getNationalTeamCrestUrl(teamId);
  const emoji = getNationalTeamFlagEmoji(teamId);

  useEffect(() => {
    setImageFailed(false);
  }, [teamId, resolvedSrc]);

  if (!resolvedSrc || imageFailed) {
    return (
      <span
        className={clsx(
          "flex items-center justify-center font-bold text-[var(--muted)]",
          fallbackClassName,
          className,
        )}
        title={teamName}
        aria-label={teamName}
      >
        {emoji !== "🏳️" ? emoji : getNationalTeamInitials(teamName)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={teamName}
      title={teamName}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setImageFailed(true)}
      className={clsx("object-contain", imgClassName, className)}
    />
  );
}
