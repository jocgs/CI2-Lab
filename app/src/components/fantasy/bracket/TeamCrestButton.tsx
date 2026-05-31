"use client";

import { NationalTeamCrestImage } from "@/components/fantasy/NationalTeamCrestImage";
import { clsx } from "@/lib/utils";

interface TeamCrestButtonProps {
  teamId: string;
  teamName: string;
  crestUrl?: string;
  selected?: boolean;
  disabled?: boolean;
  dimmed?: boolean;
  badge?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeClasses = {
  sm: { wrap: "h-16 w-full", img: "h-10 w-10", badge: "text-[8px] px-1" },
  md: { wrap: "h-[88px] w-full", img: "h-14 w-14", badge: "text-[9px] px-1.5" },
  lg: { wrap: "h-28 w-28", img: "h-[72px] w-[72px]", badge: "text-[10px] px-2" },
};

export function TeamCrestButton({
  teamId,
  teamName,
  crestUrl,
  selected = false,
  disabled = false,
  dimmed = false,
  badge,
  size = "md",
  onClick,
}: TeamCrestButtonProps) {
  const s = sizeClasses[size];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={teamName}
      className={clsx(
        "relative flex shrink-0 items-center justify-center rounded-xl border transition-all",
        s.wrap,
        selected
          ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]/30"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]",
        (disabled || dimmed) && "opacity-45",
        disabled && "cursor-not-allowed",
      )}
    >
      {badge && (
        <span
          className={clsx(
            "absolute -right-1 -top-1 z-10 rounded-full bg-[var(--brand)] font-bold text-white",
            s.badge,
          )}
        >
          {badge}
        </span>
      )}
      <NationalTeamCrestImage
        teamId={teamId}
        teamName={teamName}
        src={crestUrl}
        className="flex h-full w-full items-center justify-center"
        imgClassName={clsx(s.img, "object-contain")}
        fallbackClassName="text-2xl"
      />
    </button>
  );
}
