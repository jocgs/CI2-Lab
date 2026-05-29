"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Competition, Team } from "@/types/domain";

interface Props {
  competitions: Competition[];
  teams: Team[];
  selectedCompetition: string;
  selectedTeam: string;
  tab: string;
}

export function MatchFilters({ competitions, teams, selectedCompetition, selectedTeam, tab }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "team") params.delete("competition");
    if (key === "competition") params.delete("team");
    router.push(`/matches?${params.toString()}`);
  }

  const hasFilter = selectedCompetition || selectedTeam;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selectedCompetition}
        onChange={(e) => update("competition", e.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      >
        <option value="">Todas las competiciones</option>
        {competitions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={selectedTeam}
        onChange={(e) => update("team", e.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      >
        <option value="">Todos los equipos</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {hasFilter && (
        <Link
          href={`/matches?tab=${tab}`}
          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors"
        >
          ✕ Quitar filtros
        </Link>
      )}
    </div>
  );
}
