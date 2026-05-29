"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { ShopAvatar } from "@/types/domain";
import { purchaseAvatarAction, setActiveAvatarAction } from "@/app/tienda/actions";

interface AvatarShopCardProps {
  avatar: ShopAvatar;
  unlocked: boolean;
  active: boolean;
  coins: number;
}

export function AvatarShopCard({ avatar, unlocked, active, coins }: AvatarShopCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const canAfford = coins >= avatar.priceCoin;

  function handlePurchase() {
    setError(null);
    startTransition(async () => {
      const result = await purchaseAvatarAction(avatar.id);
      if ("error" in result) setError(result.error);
    });
  }

  function handleActivate() {
    setError(null);
    startTransition(async () => {
      const result = await setActiveAvatarAction(active ? null : avatar.id);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div
      className={
        "relative flex flex-col overflow-hidden rounded-3xl border transition-shadow " +
        (active
          ? "border-[var(--brand)] shadow-lg shadow-[var(--brand)]/20"
          : "border-[var(--border)]") +
        " bg-[var(--surface)]"
      }
    >
      {/* Imagen */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <Image
          src={avatar.imageUrl}
          alt={avatar.name}
          fill
          className={
            "object-contain p-4 transition-all duration-300 " +
            (unlocked ? "opacity-100 blur-0" : "scale-105 blur-md opacity-40 grayscale")
          }
          unoptimized
        />

        {/* Overlay bloqueado */}
        {!unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
              <LockIcon />
            </div>
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {canAfford ? "Disponible" : `Te faltan ${avatar.priceCoin - coins} 🪙`}
            </span>
          </div>
        )}

        {/* Badge activo */}
        {active && (
          <div className="absolute right-2 top-2 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ACTIVO
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-bold">{avatar.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{avatar.description}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-sm font-semibold">
            🪙 <span>{avatar.priceCoin}</span>
          </span>

          {unlocked ? (
            <button
              onClick={handleActivate}
              disabled={isPending}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50 " +
                (active
                  ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] hover:bg-red-100 hover:text-red-600"
                  : "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]")
              }
            >
              {isPending ? "…" : active ? "Desactivar" : "Activar"}
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isPending || !canAfford}
              title={!canAfford ? `Necesitas ${avatar.priceCoin - coins} monedas más` : undefined}
              className="rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Comprando…" : "Comprar"}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
