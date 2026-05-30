"use client";

import { useCallback, useEffect, useState } from "react";
import { AchievementEmoji } from "@/components/achievements/AchievementEmoji";
import { groupAchievementsByCategory, type UserAchievementWithMeta } from "@/lib/achievements";
import { clsx } from "@/lib/utils";

function AchievementDetailModal({
  achievement,
  onClose,
}: {
  achievement: UserAchievementWithMeta | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!achievement) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [achievement, onClose]);

  if (!achievement) return null;

  const { definition, unlocked, progress, current, target, rankPosition } = achievement;
  const isRanking = definition.category === "ranking";
  const showProgressBar = !unlocked && target > 1 && !isRanking;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--background)]"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4 pt-1 text-center">
          <span
            className={clsx(
              "grid h-20 w-20 place-items-center rounded-2xl",
              unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--background)]",
              !unlocked && definition.id !== "streak_10" && "grayscale",
            )}
          >
            <AchievementEmoji
              achievementId={definition.id}
              emoji={definition.emoji}
              size="lg"
            />
          </span>

          <div>
            <h3 id="achievement-modal-title" className="text-lg font-semibold">
              {definition.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {definition.description}
            </p>
          </div>

          {!unlocked && isRanking && (
            <p className="text-xs text-[var(--muted)]">
              {rankPosition != null
                ? `Tu puesto: #${rankPosition}`
                : "Aún sin posición en el ranking"}
            </p>
          )}

          {showProgressBar && (
            <div className="w-full">
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>
                  {current}/{target}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {unlocked ? (
            <span className="text-sm font-semibold text-[var(--brand-strong)]">Desbloqueado ✓</span>
          ) : (
            <span className="text-xs font-medium text-[var(--muted)]">Aún no desbloqueado</span>
          )}

          {!unlocked && !showProgressBar && !isRanking && target > 0 && (
            <p className="text-xs text-[var(--muted)]">
              Progreso: {current}/{target}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementTile({
  achievement,
  onOpen,
}: {
  achievement: UserAchievementWithMeta;
  onOpen: (achievement: UserAchievementWithMeta) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(achievement)}
      className={clsx(
        "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-colors hover:border-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]",
        achievement.unlocked
          ? "border-[var(--brand)]/30 bg-[var(--brand)]/10"
          : "border-[var(--border)] bg-[var(--background)] opacity-75 hover:opacity-100",
      )}
    >
      <AchievementEmoji
        achievementId={achievement.definition.id}
        emoji={achievement.definition.emoji}
        className={!achievement.unlocked && achievement.definition.id !== "streak_10" ? "grayscale" : undefined}
      />
      <span className="line-clamp-2 text-[10px] font-semibold leading-tight sm:text-xs">
        {achievement.definition.title}
      </span>
      {!achievement.unlocked && (
        <span className="text-[9px] font-medium uppercase tracking-wide text-[var(--muted)]">
          Bloqueado
        </span>
      )}
    </button>
  );
}

/** Vista compacta por categorías: icono + nombre; al pulsar, modal con progreso y cómo conseguirlo. */
export function AchievementsOverview({
  achievements,
  showOnlyUnlocked = false,
}: {
  achievements: UserAchievementWithMeta[];
  /** En perfil público solo se muestran los desbloqueados. */
  showOnlyUnlocked?: boolean;
}) {
  const [selected, setSelected] = useState<UserAchievementWithMeta | null>(null);
  const groups = groupAchievementsByCategory(achievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const openDetail = useCallback((achievement: UserAchievementWithMeta) => {
    setSelected(achievement);
  }, []);

  const sections = groups
    .map((group) => ({
      ...group,
      items: showOnlyUnlocked ? group.items.filter((a) => a.unlocked) : group.items,
    }))
    .filter((group) => group.items.length > 0);

  if (sections.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {showOnlyUnlocked ? "Aún sin logros desbloqueados" : "No hay logros disponibles"}
      </p>
    );
  }

  return (
    <>
      {!showOnlyUnlocked && (
        <p className="mb-5 text-sm text-[var(--muted)]">
          Desbloqueados:{" "}
          <span className="font-semibold text-[var(--brand-strong)]">
            {unlockedCount}/{achievements.length}
          </span>
        </p>
      )}

      <div className="flex flex-col gap-6">
        {sections.map((group) => (
          <section key={group.category}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {group.label}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {group.items.map((achievement) => (
                <AchievementTile
                  key={achievement.definition.id}
                  achievement={achievement}
                  onOpen={openDetail}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/** @deprecated Usa AchievementsOverview con showOnlyUnlocked */
export function PublicAchievementsDisplay({
  achievements,
}: {
  achievements: UserAchievementWithMeta[];
}) {
  return <AchievementsOverview achievements={achievements} showOnlyUnlocked />;
}

interface AchievementsGridProps {
  achievements: UserAchievementWithMeta[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [selected, setSelected] = useState<UserAchievementWithMeta | null>(null);
  const groups = groupAchievementsByCategory(achievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const openDetail = useCallback((achievement: UserAchievementWithMeta) => {
    setSelected(achievement);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((achievement) => (
              <AchievementCard
                key={achievement.definition.id}
                achievement={achievement}
                onOpenDetail={openDetail}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementCard({
  achievement,
  onOpenDetail,
}: {
  achievement: UserAchievementWithMeta;
  onOpenDetail: (achievement: UserAchievementWithMeta) => void;
}) {
  const { definition, unlocked, progress, current, target, rankPosition } = achievement;
  const isRanking = definition.category === "ranking";
  const showProgressBar = !unlocked && target > 1 && !isRanking;

  return (
    <button
      type="button"
      onClick={() => onOpenDetail(achievement)}
      className={clsx(
        "relative flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all",
        "sm:cursor-default sm:focus:outline-none",
        unlocked
          ? "border-[var(--brand)] bg-[var(--brand-soft)]/50 shadow-sm"
          : "border-[var(--border)] bg-[var(--background)] opacity-80",
      )}
    >
      {/* Móvil: icono grande + título centrados */}
      <div className="flex flex-col items-center gap-2 text-center sm:hidden">
        <span
          className={clsx(
            "grid h-16 w-16 place-items-center rounded-2xl",
            unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--surface)]",
            !unlocked && definition.id !== "streak_10" && "grayscale",
          )}
        >
          <AchievementEmoji achievementId={definition.id} emoji={definition.emoji} size="md" />
        </span>
        <p className="font-semibold text-sm leading-tight">{definition.title}</p>

        {!unlocked && isRanking && (
          <p className="text-[10px] text-[var(--muted)]">
            {rankPosition != null ? `Puesto #${rankPosition}` : "Sin posición aún"}
          </p>
        )}

        {showProgressBar && (
          <div className="mt-1 w-full">
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
      </div>

      {/* Escritorio: diseño original con descripción visible */}
      <div className="hidden sm:flex sm:flex-col sm:gap-2 sm:w-full">
        <div className="flex items-start gap-3">
          <span
            className={clsx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--surface)]",
              !unlocked && definition.id !== "streak_10" && "grayscale",
            )}
          >
            <AchievementEmoji achievementId={definition.id} emoji={definition.emoji} size="sm" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{definition.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
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
      </div>

      {unlocked && (
        <span className="absolute right-3 top-3 text-xs font-bold text-[var(--brand-strong)]">
          ✓
        </span>
      )}
    </button>
  );
}
