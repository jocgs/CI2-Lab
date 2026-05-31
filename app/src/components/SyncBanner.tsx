"use client";

import { useState, useTransition } from "react";

interface Props {
  syncedAt: string | null;
  matchCount: number;
  finishedCount: number;
}

export function SyncBanner({ syncedAt, matchCount, finishedCount }: Props) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function sync() {
    startTransition(async () => {
      setStatus("idle");
      setResult(null);
      try {
        const res = await fetch("/api/sync-matches");
        const json = await res.json();
        if (json.ok) {
          setStatus("ok");
          setResult(
            `${json.synced.worldCupMatches ?? json.synced.matches} partidos · ${json.synced.worldCupFinished ?? 0} finalizados · ${json.synced.betsResolved ?? 0} porras resueltas`,
          );
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
    ? new Date(syncedAt).toLocaleString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const hasSynced = Boolean(syncedAt);

  return (
    <div
      className={
        hasSynced
          ? "flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
      }
    >
      <span>
        {status === "ok"
          ? `✅ Sincronizado — ${result}`
          : status === "error"
            ? `❌ ${result}`
            : hasSynced
              ? `⚽ Mundial 2026 · ${matchCount} partidos · ${finishedCount} finalizados · Última sync: ${syncedTime}`
              : "⚽ Pulsa para cargar los partidos del Mundial 2026 desde football-data.org"}
      </span>
      <button
        type="button"
        onClick={sync}
        disabled={isPending}
        className={
          hasSynced
            ? "shrink-0 rounded-lg border border-emerald-300 px-2.5 py-1 font-medium hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:hover:bg-emerald-900"
            : "shrink-0 rounded-lg border border-amber-300 px-2.5 py-1 font-medium hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:hover:bg-amber-900"
        }
      >
        {isPending ? "Actualizando…" : hasSynced ? "Actualizar" : "Sincronizar Mundial"}
      </button>
    </div>
  );
}
