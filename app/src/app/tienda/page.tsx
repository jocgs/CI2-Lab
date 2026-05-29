import { getCurrentUser } from "@/lib/db";
import { SHOP_AVATARS, COINS_PER_POINT } from "@/lib/shop-avatars";
import { AvatarShopCard } from "@/components/AvatarShopCard";
import { SectionTitle } from "@/components/ui";

export default async function TiendaPage() {
  const user = await getCurrentUser();
  const coins = user.coins ?? 0;
  const unlocked = user.unlockedAvatarIds ?? [];
  const activeId = user.activeAvatarId ?? null;

  const wc2026 = SHOP_AVATARS.filter((a) => a.competitionTag === "WC2026");
  const clasicas = SHOP_AVATARS.filter((a) => a.competitionTag === "WC_CLASICAS");

  const unlockedWc = unlocked.filter((id) => wc2026.some((a) => a.id === id)).length;
  const unlockedCla = unlocked.filter((id) => clasicas.some((a) => a.id === id)).length;

  return (
    <div className="flex flex-col gap-10">
      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-400 to-yellow-300 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/80">Tienda</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Avatares</h1>
            <p className="mt-1 max-w-xl text-sm text-white/90">
              Gana porras para acumular monedas y desbloquear mascotas únicas del fútbol mundial.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-white/20 px-5 py-3 backdrop-blur">
                <p className="text-xs font-medium text-white/80">Tu saldo</p>
                <p className="mt-0.5 text-2xl font-bold">🪙 {coins}</p>
              </div>
              <div className="rounded-2xl bg-white/20 px-5 py-3 backdrop-blur">
                <p className="text-xs font-medium text-white/80">Por porra acertada</p>
                <p className="mt-0.5 text-2xl font-bold">+{COINS_PER_POINT} 🪙</p>
              </div>
              <div className="rounded-2xl bg-white/20 px-5 py-3 backdrop-blur">
                <p className="text-xs font-medium text-white/80">Mascotas WC2026</p>
                <p className="mt-0.5 text-2xl font-bold">100 🪙</p>
              </div>
              <div className="rounded-2xl bg-white/20 px-5 py-3 backdrop-blur">
                <p className="text-xs font-medium text-white/80">Mascotas clásicas</p>
                <p className="mt-0.5 text-2xl font-bold">30 🪙</p>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none flex shrink-0 items-end justify-center sm:justify-end sm:pl-4"
          >
            {wc2026.map((avatar, index) => (
              <div
                key={avatar.id}
                className="h-36 w-20 bg-black opacity-50 sm:h-48 sm:w-28"
                style={{
                  marginLeft: index > 0 ? "-1.25rem" : undefined,
                  WebkitMaskImage: `url(${avatar.imageUrl})`,
                  maskImage: `url(${avatar.imageUrl})`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "bottom center",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mascotas WC 2026 ─────────────────────────────────────────────── */}
      <section>
        {/* Banner "Edición limitada" */}
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <span className="mt-0.5 text-xl">⚡</span>
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">Edición Limitada · Mundial 2026</p>
            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/70">
              Estas mascotas son exclusivas del Mundial FIFA 2026. Una vez que termine el torneo,
              desaparecerán de la tienda para siempre. ¡No dejes escapar la oportunidad!
            </p>
          </div>
        </div>

        <SectionTitle
          title="Mascotas del Mundial 2026"
          subtitle={`${unlockedWc} / ${wc2026.length} desbloqueadas · 100 🪙 c/u`}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {wc2026.map((avatar) => (
            <AvatarShopCard
              key={avatar.id}
              avatar={avatar}
              unlocked={unlocked.includes(avatar.id)}
              active={activeId === avatar.id}
              coins={coins}
            />
          ))}
        </div>
      </section>

      {/* ── Mascotas de otros Mundiales ───────────────────────────────────── */}
      <section>
        <SectionTitle
          title="Mascotas de otros Mundiales"
          subtitle={`${unlockedCla} / ${clasicas.length} desbloqueadas · 30 🪙 c/u`}
        />
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {clasicas.map((avatar) => (
            <AvatarShopCard
              key={avatar.id}
              avatar={avatar}
              unlocked={unlocked.includes(avatar.id)}
              active={activeId === avatar.id}
              coins={coins}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
