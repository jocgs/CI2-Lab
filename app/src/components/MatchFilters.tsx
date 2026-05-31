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
  /** true si la URL incluye ?competition= (aunque esté vacío = todas). */
  competitionInUrl: boolean;
}

export function MatchFilters({
  competitions,
  teams,
  selectedCompetition,
  selectedTeam,
  tab,
  competitionInUrl,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "competition") {
      params.set("competition", value);
      params.delete("team");
    } else if (key === "team") {
      if (value) {
        params.set("team", value);
      } else {
        params.delete("team");
      }
      params.delete("competition");
    }
    router.push(`/matches?${params.toString()}`);
  }

  const hasFilter = Boolean(selectedTeam) || (competitionInUrl && selectedCompetition !== "");

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
          href={`/matches?tab=${tab}&competition=`}
          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors"
        >
          ✕ Quitar filtros
        </Link>
      )}
    </div>
  );
}
