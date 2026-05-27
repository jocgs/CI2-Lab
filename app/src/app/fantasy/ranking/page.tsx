import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import { getFantasyRankingByCompetition } from "@/lib/fantasy-db";
import { FantasyRankingTable } from "@/components/fantasy/FantasyRankingTable";
import { SectionTitle } from "@/components/ui";

export default async function FantasyRankingPage() {
  const user = await getCurrentUser();
  const ranking = await getFantasyRankingByCompetition("world_cup_2026");

  const myEntry = ranking.find((e) => e.userId === user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ranking Fantasy</h1>
          <p className="text-sm text-[var(--muted)]">Mundial 2026 · {ranking.length} equipos</p>
        </div>
        <Link
          href="/fantasy"
          className="text-sm font-medium text-[var(--brand-strong)] hover:underline"
        >
          ← Volver
        </Link>
      </div>

      {/* My position highlight */}
      {myEntry && (
        <div className="rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] px-5 py-4">
          <p className="text-xs text-[var(--muted)] mb-1">Tu posición</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--brand-strong)]">
                #{myEntry.rank} — {myEntry.teamName}
              </p>
              <p className="text-sm text-[var(--muted)]">{myEntry.label}</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-[var(--brand-strong)]">
              {myEntry.totalPoints} pts
            </p>
          </div>
        </div>
      )}

      <SectionTitle
        title="Clasificación general"
        subtitle="Ordenada por puntos totales. Recálculo en tiempo real."
      />

      <FantasyRankingTable entries={ranking} currentUserId={user.id} />

      {ranking.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-base font-medium">El ranking está vacío</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sé el primero en crear tu equipo.
          </p>
          <Link
            href="/fantasy/builder"
            className="mt-4 inline-block rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Crear equipo
          </Link>
        </div>
      )}
    </div>
  );
}
