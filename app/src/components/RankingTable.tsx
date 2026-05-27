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
                  {entry.correctBets} aciertos · {entry.exactBets} exactos · {entry.accuracy}%
                </p>
              </div>
            </div>
            <p className="text-base font-semibold tabular-nums">{entry.totalPoints} pts</p>
          </li>
        );
      })}
    </ol>
  );
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
