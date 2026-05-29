"use client";

import { useEffect, useMemo, useState } from "react";
import type { FantasyPlayer } from "@/types/fantasy";
import { clsx } from "@/lib/utils";

interface PlayerAvatarProps {
  player: FantasyPlayer;
  size?: number;
  className?: string;
}

export function PlayerAvatar({ player, size = 36, className }: PlayerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [player.photoUrl]);

  const initials = useMemo(
    () =>
      player.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [player.name],
  );

  const photoUrl = player.photoUrl?.trim();
  const canRenderPhoto = Boolean(photoUrl && !imageFailed && !photoUrl.includes("images.fifa.com"));

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--background)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {canRenderPhoto ? (
        <img
          src={photoUrl}
          alt={player.name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-[var(--brand-soft)] text-[var(--brand-strong)] text-[10px] font-semibold uppercase">
          {initials}
        </span>
      )}
    </span>
  );
}