"use client";

import type { FantasyRankingEntry } from "@/types/fantasy";
import { clsx } from "@/lib/utils";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface FantasyRankingTableProps {
  entries: FantasyRankingEntry[];
  currentUserId: string;
}

export function FantasyRankingTable({
  entries,
  currentUserId,
}: FantasyRankingTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
        <p className="text-base font-medium">Aún no hay equipos en el ranking</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Crea tu equipo para aparecer aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
            <th className="px-3 py-3 w-12">#</th>
            <th className="px-3 py-3">Usuario</th>
            <th className="px-3 py-3 hidden sm:table-cell">Equipo</th>
            <th className="px-3 py-3 hidden md:table-cell">Capitán</th>
            <th className="px-3 py-3 hidden md:table-cell">Campeona</th>
            <th className="px-3 py-3 text-right">Puntos</th>
            <th className="px-3 py-3 text-right hidden sm:table-cell">Dif.</th>
            <th className="px-3 py-3 hidden lg:table-cell">Etiqueta</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isEven = i % 2 === 0;
            return (
              <tr
                key={entry.userId}
                className={clsx(
                  "border-b border-[var(--border)] last:border-0 transition-colors",
                  isCurrentUser
                    ? "bg-[var(--brand-soft)] font-medium"
                    : isEven
                    ? "bg-[var(--surface)]"
                    : "bg-[var(--background)]",
                )}
              >
                {/* Rank */}
                <td className="px-3 py-3 text-center">
                  {MEDALS[entry.rank] ?? (
                    <span className="text-[var(--muted)]">{entry.rank}</span>
                  )}
                </td>

                {/* User */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-xs font-semibold text-[var(--brand-strong)]">
                      {entry.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{entry.displayName}</p>
                      <p className="text-xs text-[var(--muted)] sm:hidden">{entry.teamName}</p>
                    </div>
                    {isCurrentUser && (
                      <span className="ml-1 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Tú
                      </span>
                    )}
                  </div>
                </td>

                {/* Team name */}
                <td className="px-3 py-3 text-[var(--muted)] hidden sm:table-cell">
                  {entry.teamName}
                </td>

                {/* Captain */}
                <td className="px-3 py-3 hidden md:table-cell">
                  <span className="text-xs">⭐ {entry.captainName}</span>
                </td>

                {/* Champion team */}
                <td className="px-3 py-3 text-[var(--muted)] hidden md:table-cell text-xs">
                  {entry.championTeamName}
                </td>

                {/* Points */}
                <td className="px-3 py-3 text-right">
                  <span className="font-semibold tabular-nums text-[var(--brand-strong)]">
                    {entry.totalPoints}
                  </span>
                </td>

                {/* Diff */}
                <td className="px-3 py-3 text-right hidden sm:table-cell">
                  {entry.rank === 1 ? (
                    <span className="text-[var(--muted)]">—</span>
                  ) : (
                    <span
                      className={clsx(
                        "text-xs tabular-nums",
                        entry.pointsDiff < 0
                          ? "text-red-500"
                          : "text-[var(--muted)]",
                      )}
                    >
                      {entry.pointsDiff}
                    </span>
                  )}
                </td>

                {/* Label */}
                <td className="px-3 py-3 hidden lg:table-cell">
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {entry.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
