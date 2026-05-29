import Image from "next/image";
import { SignInButton } from "@/components/SignInButton";
import { BRAND_ASSETS, HERO_ASSETS } from "@/lib/constants/assets";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-4xl items-center gap-12 lg:gap-20">

        {/* Hero decorativo — solo desktop */}
        <div
          className="page-hero hidden flex-1 lg:block"
          style={{ backgroundImage: `url(${HERO_ASSETS.home})`, minHeight: 340 }}
        >
          <div className="page-hero__content">
            <h2 className="text-2xl font-bold tracking-tight">TikiTaka</h2>
            <p className="mt-2 text-sm">
              Predice los partidos, compite con amigos y sube en el ranking.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="flex w-full max-w-sm flex-col gap-6">

          {/* Branding */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Image
              src={BRAND_ASSETS.logoIconTransparent}
              alt="TikiTaka"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
              unoptimized
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TikiTaka</h1>
              <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">
                Haz porras de fútbol con amigos y compite por el ranking.
              </p>
            </div>
          </div>

          {/* Tarjeta de acceso */}
          <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Acceder</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Crea una cuenta o entra con tu email.
            </p>
            <SignInButton />
          </div>

        </div>
      </div>
    </div>
  );
}
