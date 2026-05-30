import { clsx } from "@/lib/utils";

/** Dos llamas superpuestas para el logro «Imparable». */
export function DoubleFlameIcon({ className }: { className?: string }) {
  return (
    <span
      className={clsx("relative inline-block h-[1.15em] w-[1.25em] shrink-0", className)}
      aria-hidden
    >
      <span
        className="absolute bottom-0 left-0 text-[0.92em] leading-none drop-shadow-sm"
        style={{ transform: "translate(-8%, 4%) rotate(-12deg)" }}
      >
        🔥
      </span>
      <span
        className="absolute bottom-0 right-0 text-[0.92em] leading-none drop-shadow-sm"
        style={{ transform: "translate(8%, -2%) rotate(10deg)" }}
      >
        🔥
      </span>
    </span>
  );
}

export function AchievementEmoji({
  achievementId,
  emoji,
  className,
  size = "md",
}: {
  achievementId: string;
  emoji: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-xl" : "text-3xl";

  if (achievementId === "streak_10") {
    return (
      <span className={clsx("inline-flex items-center justify-center", sizeClass, className)}>
        <DoubleFlameIcon
          className={size === "lg" ? "h-14 w-14" : size === "sm" ? "h-6 w-6" : "h-9 w-9"}
        />
      </span>
    );
  }

  return (
    <span className={clsx("leading-none", sizeClass, className)} aria-hidden>
      {emoji}
    </span>
  );
}
