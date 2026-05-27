"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeagueAction, joinLeagueAction, leaveLeagueAction } from "./league-actions";
import type { FantasyLeague } from "@/types/fantasy";

// ─── Create League Form ───────────────────────────────────────────────────────

export function CreateLeagueForm({ competitionId }: { competitionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; inviteCode: string } | null>(null);

  function handleCreate() {
    if (!name.trim()) { setError("Escribe un nombre para la liga."); return; }
    setError(null);
    startTransition(async () => {
      const result = await createLeagueAction({ name, competitionId });
      if (result.error) {
        setError(result.error);
      } else if (result.league) {
        setCreated(result.league);
      }
    });
  }

  if (created) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
        <p className="font-semibold text-green-800 dark:text-green-300">✅ ¡Liga creada!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Comparte este código con tus amigos para que se unan:
        </p>
        <p className="mt-2 rounded-xl bg-white px-4 py-2 text-center text-2xl font-bold tracking-widest text-[var(--brand)] dark:bg-black/20">
          {created.inviteCode}
        </p>
        <button
          onClick={() => router.push(`/fantasy/leagues/${created.id}`)}
          className="mt-3 w-full rounded-xl bg-[var(--brand)] py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Ver mi liga →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Nombre de la liga"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        maxLength={40}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
      >
        {isPending ? "Creando…" : "Crear liga"}
      </button>
    </div>
  );
}

// ─── Join League Form ─────────────────────────────────────────────────────────

export function JoinLeagueForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleJoin() {
    if (!code.trim()) { setError("Introduce el código de invitación."); return; }
    setError(null);
    startTransition(async () => {
      const result = await joinLeagueAction(code);
      if (result.error) {
        setError(result.error);
      } else if (result.leagueId) {
        router.push(`/fantasy/leagues/${result.leagueId}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Código de invitación (ej. CRACKS)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        maxLength={10}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={isPending}
        className="rounded-xl border border-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--brand)] hover:bg-[var(--brand-soft)] disabled:opacity-40"
      >
        {isPending ? "Uniéndome…" : "Unirse a liga"}
      </button>
    </div>
  );
}

// ─── League Card ──────────────────────────────────────────────────────────────

export function LeagueCard({
  league,
  currentUserId,
}: {
  league: FantasyLeague;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isOwner = league.ownerId === currentUserId;

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveLeagueAction(league.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{league.name}</p>
          <p className="text-xs text-[var(--muted)]">
            {league.memberIds.length} participante{league.memberIds.length !== 1 ? "s" : ""}
            {isOwner && " · creada por ti"}
          </p>
        </div>
        <span className="rounded-lg bg-[var(--brand-soft)] px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-[var(--brand-strong)]">
          {league.inviteCode}
        </span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/fantasy/leagues/${league.id}`)}
          className="flex-1 rounded-xl bg-[var(--brand)] py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Ver ranking
        </button>
        {!isOwner && (
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:border-red-300 hover:text-red-500 disabled:opacity-40"
          >
            {isPending ? "…" : "Salir"}
          </button>
        )}
      </div>
    </div>
  );
}
