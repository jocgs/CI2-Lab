"use client";

import { useEffect, useMemo, useState } from "react";
import type { FantasyPlayer } from "@/types/fantasy";
import { getPlayerPhotoProxyPath } from "@/lib/player-photo-resolver";
import { clsx } from "@/lib/utils";

interface PlayerAvatarProps {
  player: FantasyPlayer;
  size?: number;
  className?: string;
}

export function PlayerAvatar({ player, size = 36, className }: PlayerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const photoSrc = useMemo(
    () => getPlayerPhotoProxyPath(player.id),
    [player.id],
  );

  useEffect(() => {
    setImageFailed(false);
  }, [player.id, player.name]);

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

  const showPhoto = !imageFailed;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--background)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <img
          src={photoSrc}
          alt={player.name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover object-[center_20%] bg-[var(--surface)]"
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-[var(--brand-soft)] text-[var(--brand-strong)] text-[10px] font-semibold uppercase">
          {initials}
        </span>
      )}
    </span>
  );
}
