"use client";

interface Props {
  streak: number;
}

const FIRE_THRESHOLD = 5;

export function LogoIcon({ streak }: Props) {
  const onFire = streak >= FIRE_THRESHOLD;

  return (
    <span
      aria-label={onFire ? `Racha de ${streak} aciertos 🔥` : "Porrify"}
      title={onFire ? `¡Racha de ${streak}! 🔥` : "Porrify"}
      className={
        "grid h-8 w-8 place-items-center rounded-full text-white text-sm font-bold shadow-sm " +
        (onFire ? "logo-on-fire" : "bg-[var(--brand)]")
      }
    >
      <span>{onFire ? "🔥" : "P"}</span>
    </span>
  );
}
