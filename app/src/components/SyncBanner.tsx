"use client";

import { useState, useTransition } from "react";

interface Props {
  hasLiveData: boolean;
  syncedAt: string | null;
  matchCount: number | null;
}

export function SyncBanner({ hasLiveData, syncedAt, matchCount }: Props) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function sync() {
    startTransition(async () => {
      setStatus("idle");
      try {
        const res = await fetch("/api/sync-matches");
        const json = await res.json();
        if (json.ok) {
          setStatus("ok");
          setResult(
            `${json.synced.matches} partidos · ${json.synced.teams} equipos · ${json.synced.competitions} competiciones`
          );
          // Forzar recarga para que las páginas sirvan el nuevo live-store
          setTimeout(() => window.location.reload(), 800);
        } else {
          setStatus("error");
          setResult(json.error ?? "Error desconocido");
        }
      } catch (e) {
        setStatus("error");
        setResult(String(e));
      }
    });
  }

  const syncedTime = syncedAt
    ? new Date(syncedAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (hasLiveData) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        <span>
          ✅ Datos reales · {matchCount} partidos · Sincronizado a las {syncedTime}
        </span>
        <button
          onClick={sync}
          disabled={isPending}
          className="rounded-lg border border-emerald-300 px-2.5 py-1 font-medium hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:hover:bg-emerald-900"
        >
          {isPending ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
      <span>
        {status === "ok"
          ? `✅ Sincronizado — ${result}`
          : status === "error"
            ? `❌ Error: ${result}`
            : "⚽ Viendo datos de ejemplo — pulsa para cargar partidos reales de football-data.org"}
      </span>
      <button
        onClick={sync}
        disabled={isPending || status === "ok"}
        className="rounded-lg border border-amber-300 px-2.5 py-1 font-medium hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:hover:bg-amber-900"
      >
        {isPending ? "Sincronizando…" : status === "ok" ? "¡Listo!" : "Sincronizar"}
      </button>
    </div>
  );
}
