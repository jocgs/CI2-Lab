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
  const canAfford = coins >= avatar.priceCoin;

  function handleBuy() {
    startTransition(() => { void purchaseAvatarAction(avatar.id); });
  }

  function handleToggleActive() {
    startTransition(() => { void setActiveAvatarAction(active ? null : avatar.id); });
  }

  return (
    <div
      className={`relative flex h-full flex-col items-center gap-3 rounded-2xl border p-5 transition-shadow
        ${active
          ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-md"
          : "border-[var(--border)] bg-[var(--surface)]"
        }`}
    >
      {/* Badge edición limitada */}
      {avatar.exclusive && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          ⚡ Edición limitada
        </span>
      )}

      {/* Imagen */}
      <div className="relative mt-1 h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[var(--background)]">
        <Image
          src={avatar.imageUrl}
          alt={avatar.name}
          fill
          className={`object-contain p-2 transition-all duration-300
            ${!unlocked ? "blur-[2px] grayscale opacity-50" : ""}`}
        />

        {/* Candado sobre avatar bloqueado */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl drop-shadow-lg">🔒</span>
          </div>
        )}

        {/* Badge ACTIVO */}
        {active && (
          <span className="absolute bottom-1 right-1 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-bold text-white">
            Activo
          </span>
        )}
      </div>

      {/* Nombre + descripción */}
      <div className="flex w-full flex-1 flex-col text-center">
        <p className="font-semibold">{avatar.name}</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{avatar.description}</p>
        {!unlocked && (
          <p className="mt-1.5 text-xs font-semibold text-amber-500">
            {avatar.priceCoin} 🪙
          </p>
        )}
      </div>

      {/* Botón */}
      {unlocked ? (
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className={`mt-auto w-full shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60
            ${active
              ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-red-300 hover:text-red-500"
              : "bg-[var(--brand)] text-white hover:opacity-90"
            }`}
        >
          {isPending ? "…" : active ? "Desactivar" : "Activar"}
        </button>
      ) : (
        <button
          onClick={handleBuy}
          disabled={isPending || !canAfford}
          className="mt-auto w-full shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          title={!canAfford ? `Necesitas ${avatar.priceCoin - coins} 🪙 más` : undefined}
        >
          {isPending
            ? "Comprando…"
            : !canAfford
            ? `Te faltan ${avatar.priceCoin - coins} 🪙`
            : `Comprar · ${avatar.priceCoin} 🪙`}
        </button>
      )}
    </div>
  );
}
