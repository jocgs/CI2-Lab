"use client";

import Image from "next/image";
import { useTransition } from "react";
import { purchaseAvatarAction, setActiveAvatarAction } from "@/app/tienda/actions";
import type { ShopAvatar } from "@/lib/shop-avatars";

interface Props {
  avatar: ShopAvatar;
  unlocked: boolean;
  active: boolean;
  coins: number;
}

export function AvatarShopCard({ avatar, unlocked, active, coins }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleBuy() {
    startTransition(() => { void purchaseAvatarAction(avatar.id); });
  }

  function handleToggleActive() {
    startTransition(() => { void setActiveAvatarAction(active ? null : avatar.id); });
  }

  return (
    <div className={`flex h-full flex-col items-center gap-3 rounded-2xl border p-5 transition-shadow ${active ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-md" : "border-[var(--border)] bg-[var(--surface)]"}`}>
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[var(--background)]">
        <Image src={avatar.imageUrl} alt={avatar.name} fill className="object-contain p-2" />
        {active && (
          <span className="absolute bottom-1 right-1 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-bold text-white">
            Activo
          </span>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col text-center">
        <p className="font-semibold">{avatar.name}</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{avatar.description}</p>
      </div>

      {unlocked ? (
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className={`mt-auto w-full shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${active ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-red-300 hover:text-red-500" : "bg-[var(--brand)] text-white hover:opacity-90"}`}
        >
          {isPending ? "…" : active ? "Desactivar" : "Activar"}
        </button>
      ) : (
        <button
          onClick={handleBuy}
          disabled={isPending || coins < avatar.priceCoin}
          className="mt-auto w-full shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Comprando…" : coins < avatar.priceCoin ? "Sin monedas" : `Comprar · ${avatar.priceCoin} 🪙`}
        </button>
      )}
    </div>
  );
}
