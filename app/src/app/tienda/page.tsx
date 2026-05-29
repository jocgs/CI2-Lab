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

  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-400 to-yellow-300 p-6 text-white shadow-md sm:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-white/80">Tienda</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Avatares WC 2026</h1>
        <p className="mt-1 text-sm text-white/90">
          Gana porras para acumular monedas y desbloquear las mascotas oficiales del Mundial.
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
            <p className="text-xs font-medium text-white/80">Precio por avatar</p>
            <p className="mt-0.5 text-2xl font-bold">100 🪙</p>
          </div>
        </div>
      </section>

      {/* Mascotas WC 2026 */}
      <section>
        <SectionTitle
          title="Mascotas del Mundial 2026"
          subtitle={`${unlocked.filter((id) => wc2026.some((a) => a.id === id)).length} / ${wc2026.length} desbloqueadas`}
        />
        <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Nota informativa */}
      <p className="text-center text-xs text-[var(--muted)]">
        Más colecciones próximamente · LaLiga, Champions League y más.
      </p>
    </div>
  );
}
