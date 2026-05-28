import Link from "next/link";
import type { RankingEntry } from "@/types/domain";
import { clsx } from "@/lib/utils";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export function RankingTable({ entries, currentUserId }: { entries: RankingEntry[]; currentUserId: string }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted)]">
        Aún no hay datos suficientes para mostrar un ranking.
      </p>
    );
  }

  return (
    <ol className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {entries.map((entry, index) => {
        const isMe = entry.userId === currentUserId;
        const isMedal = index <= 2;
        const medalBackgrounds: Record<number, string> = {
          0: "bg-gradient-to-r from-amber-400/20 to-amber-300/10",
          1: "bg-gradient-to-r from-slate-400/25 to-slate-300/15",
          2: "bg-gradient-to-r from-orange-400/20 to-orange-300/10",
        };
        const medalBorders: Record<number, string> = {
          0: "border-amber-400/30",
          1: "border-slate-400/40",
          2: "border-orange-400/30",
        };
        
        return (
          <li
            key={entry.userId}
            className={clsx(
              "flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors",
              index !== 0 && "border-t border-[var(--border)]",
              isMedal && medalBackgrounds[index],
              isMedal && "border-l-4 " + medalBorders[index],
              isMe && "bg-[var(--brand-soft)]/50",
            )}
          >
            <div className="flex items-center gap-3">
              {/* Posición + Avatar */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--muted)] w-6 text-center">
                  #{index + 1}
                </span>
                <ProfileAvatar
                  avatarUrl={entry.avatarUrl}
                  displayName={entry.displayName}
                  size="sm"
                  zoomable={false}
                />
              </div>
              {/* Nombre y stats */}
              <div>
                <p className="font-medium">
                  <Link href={`/users/${entry.username}`} className="hover:underline">
                    {entry.displayName}
                  </Link>
                  {isMe && <span className="ml-2 text-xs text-[var(--brand-strong)]">(tú)</span>}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {entry.correctBets} aciertos · {entry.exactBets} exactos · {entry.accuracy}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RankChange change={entry.rankChange} />
              <p className="text-base font-semibold tabular-nums">{entry.totalPoints} pts</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RankChange({ change }: { change?: number }) {
  if (change === undefined) return null;
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M5 1 L9 8 L1 8 Z" />
      </svg>
      {change}
    </span>
  );
  if (change < 0) return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M5 9 L9 2 L1 2 Z" />
      </svg>
      {Math.abs(change)}
    </span>
  );
  return <span className="text-xs text-[var(--muted)]">—</span>;
}

