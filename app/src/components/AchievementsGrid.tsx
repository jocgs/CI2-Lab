import type { UserAchievement } from "@/types/achievements";
import { groupAchievementsByCategory, type UserAchievementWithMeta } from "@/lib/achievements";
import { clsx } from "@/lib/utils";

// Componente visual simplificado para mostrar logros en perfil público
export function PublicAchievementsDisplay({ achievements }: { achievements: UserAchievementWithMeta[] }) {
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  if (unlockedAchievements.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <p>Aún sin logros desbloqueados</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {unlockedAchievements.map((achievement) => (
        <div
          key={achievement.definition.id}
          className="relative group"
          title={achievement.definition.title}
        >
          <div className="h-10 w-10 rounded-xl bg-[var(--brand)]/20 flex items-center justify-center text-xl border border-[var(--brand)]/30 hover:border-[var(--brand)] transition-colors">
            {achievement.definition.emoji}
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
            <p className="font-semibold">{achievement.definition.title}</p>
            <p className="text-[var(--muted)] text-[10px] mt-0.5">{achievement.definition.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AchievementsGridProps {
  achievements: UserAchievementWithMeta[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const groups = groupAchievementsByCategory(achievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Desbloqueados:{" "}
          <span className="font-semibold text-[var(--brand-strong)]">
            {unlockedCount}/{achievements.length}
          </span>
        </p>
      </div>

      {groups.map(({ category, label, items }) => (
        <div key={category}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {label}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((achievement) => (
              <AchievementCard key={achievement.definition.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: UserAchievementWithMeta }) {
  const { definition, unlocked, progress, current, target, rankPosition } = achievement;
  const isRanking = definition.category === "ranking";
  const showProgressBar = !unlocked && target > 1 && !isRanking;

  return (
    <div
      className={clsx(
        "relative flex flex-col gap-2 rounded-2xl border p-4 transition-all",
        unlocked
          ? "border-[var(--brand)] bg-[var(--brand-soft)]/50 shadow-sm"
          : "border-[var(--border)] bg-[var(--background)] opacity-80",
      )}
      title={definition.description}
    >
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl",
            unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--surface)] grayscale",
          )}
        >
          {definition.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight">{definition.title}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-2">
            {definition.description}
          </p>
        </div>
      </div>

      {!unlocked && isRanking && (
        <p className="text-[10px] text-[var(--muted)]">
          {rankPosition != null ? `Tu puesto: #${rankPosition}` : "Aún sin posición en el ranking"}
        </p>
      )}

      {showProgressBar && (
        <div className="mt-1">
          <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
            <span>
              {current}/{target}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {unlocked && (
        <span className="absolute right-3 top-3 text-xs font-bold text-[var(--brand-strong)]">
          ✓
        </span>
      )}
    </div>
  );
}
