export type AppBackgroundId = "original" | "futbol" | "futbol-pintado" | "futbol-rayas";

const BACKGROUNDS: Record<
  Exclude<AppBackgroundId, "original">,
  { src: string; opacity: number }
> = {
  futbol: { src: "/backgrounds/futbol.jpeg", opacity: 0.8 },
  "futbol-pintado": { src: "/backgrounds/futbol-pintado.jpeg", opacity: 0.75 },
  "futbol-rayas": { src: "/backgrounds/futbol-rayas.jpeg", opacity: 0.75 },
};

export function AppBackground({ variant }: { variant: AppBackgroundId }) {
  if (variant === "original") return null;

  const bg = BACKGROUNDS[variant];
  if (!bg) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bg.src})`,
        opacity: bg.opacity,
      }}
    />
  );
}
