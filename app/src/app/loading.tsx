import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] w-full flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium">Cargando…</p>
      <Image
        src="/balon-futbol.png"
        alt="Cargando"
        width={64}
        height={64}
        className="animate-spin"
        priority
        unoptimized
      />
    </div>
  );
}
