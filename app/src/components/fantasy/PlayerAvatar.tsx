"use client";

import { useEffect, useMemo, useState } from "react";
import type { FantasyPlayer } from "@/types/fantasy";
import {
  getPlayerPhotoProxyPath,
  getPlayerPhotoStaticPath,
} from "@/lib/player-photo-resolver";
import { clsx } from "@/lib/utils";

interface PlayerAvatarProps {
  player: FantasyPlayer;
  size?: number;
  className?: string;
  /** Carga inmediata (campo, confirmación) en lugar de lazy. */
  priority?: boolean;
}

type PhotoSource = "static" | "api";

export function PlayerAvatar({ player, size = 36, className, priority = false }: PlayerAvatarProps) {
  const [source, setSource] = useState<PhotoSource>("static");
  const [imageFailed, setImageFailed] = useState(false);

  const photoSrc = useMemo(
    () =>
      source === "static"
        ? getPlayerPhotoStaticPath(player.id)
        : getPlayerPhotoProxyPath(player.id),
    [player.id, source],
  );

  useEffect(() => {
    setSource("static");
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

  function handleError() {
    if (source === "static") {
      setSource("api");
      return;
    }
    setImageFailed(true);
  }

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
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onError={handleError}
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
