"use client";

import { useState } from "react";
import { clsx } from "@/lib/utils";

export function ProfileAvatar({
  avatarUrl,
  displayName,
  size = "lg",
  zoomable = true,
}: {
  avatarUrl?: string;
  displayName: string;
  size?: "sm" | "lg";
  zoomable?: boolean;
}) {
  const effectiveUrl = avatarUrl;
  const [isExpanded, setIsExpanded] = useState(false);
  const sizeClass = size === "sm" ? "h-12 w-12 text-lg" : "h-20 w-20 text-3xl";

  if (!effectiveUrl) {
    return (
      <div
        className={clsx(
          "grid shrink-0 place-items-center rounded-full bg-white/20 font-bold text-white",
          sizeClass,
        )}
      >
        {displayName.charAt(0)}
      </div>
    );
  }

  return (
    <>
      {zoomable ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={clsx(
            "block shrink-0 overflow-hidden rounded-full border-2 border-white/40 shadow-lg transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/80",
            sizeClass,
          )}
          aria-label={`Ampliar foto de ${displayName}`}
        >
          <img src={effectiveUrl} alt={displayName} className="h-full w-full object-cover" />
        </button>
      ) : (
        <div
          className={clsx(
            "block shrink-0 overflow-hidden rounded-full border-2 border-white/40 shadow-lg",
            sizeClass,
          )}
        >
          <img src={effectiveUrl} alt={displayName} className="h-full w-full object-cover" />
        </div>
      )}

      {isExpanded && zoomable && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar foto ampliada"
            onClick={() => setIsExpanded(false)}
          />
          <div className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <img src={effectiveUrl} alt={displayName} className="max-h-[90vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </>
  );
}