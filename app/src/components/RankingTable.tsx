import type { RankingEntry } from "@/types/domain";
import { CURRENT_USER_ID } from "@/lib/mocks";
import { clsx } from "@/lib/utils";

export function RankingTable({ entries }: { entries: RankingEntry[] }) {
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
        const isMe = entry.userId === CURRENT_USER_ID;
        return (
          <li
            key={entry.userId}
            className={clsx(
              "flex items-center justify-between gap-3 px-4 py-3 text-sm",
              index !== 0 && "border-t border-[var(--border)]",
              isMe && "bg-[var(--brand-soft)]/50",
            )}
          >
            <div className="flex items-center gap-3">
              <Position index={index} />
              <div>
                <p className="font-medium">
                  {entry.displayName}
                  {isMe && <span className="ml-2 text-xs text-[var(--brand-strong)]">(tú)</span>}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {entry.correctBets}/{entry.totalBets} aciertos · {entry.accuracy}%
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

function Position({ index }: { index: number }) {
  const medals: Record<number, string> = { 0: "bg-amber-400", 1: "bg-zinc-300", 2: "bg-orange-400" };
  return (
    <span
      className={clsx(
        "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
        medals[index] ?? "bg-[var(--border)] text-[var(--muted)]",
        index <= 2 && "text-white",
      )}
    >
      {index + 1}
    </span>
  );
}
