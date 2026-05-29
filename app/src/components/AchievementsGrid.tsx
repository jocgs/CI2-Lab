"use client";

import { useCallback, useEffect, useState } from "react";
import { groupAchievementsByCategory, type UserAchievementWithMeta } from "@/lib/achievements";
import { clsx } from "@/lib/utils";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:hidden"
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
              "grid h-20 w-20 place-items-center rounded-2xl text-5xl",
              unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--background)] grayscale",
            )}
          >
            {definition.emoji}
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

          {unlocked && (
            <span className="text-sm font-semibold text-[var(--brand-strong)]">Desbloqueado ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente visual simplificado para mostrar logros en perfil público
export function PublicAchievementsDisplay({
  achievements,
}: {
  achievements: UserAchievementWithMeta[];
}) {
  const [selected, setSelected] = useState<UserAchievementWithMeta | null>(null);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  const openDetail = useCallback((achievement: UserAchievementWithMeta) => {
    if (isMobileViewport()) setSelected(achievement);
  }, []);

  if (unlockedAchievements.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <p>Aún sin logros desbloqueados</p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: rejilla con icono grande + título */}
      <div className="grid grid-cols-3 gap-3 sm:hidden">
        {unlockedAchievements.map((achievement) => (
          <button
            key={achievement.definition.id}
            type="button"
            onClick={() => openDetail(achievement)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand)]/10 p-3 text-center transition-colors hover:border-[var(--brand)]"
          >
            <span className="text-3xl leading-none">{achievement.definition.emoji}</span>
            <span className="line-clamp-2 text-[10px] font-semibold leading-tight">
              {achievement.definition.title}
            </span>
          </button>
        ))}
      </div>

      {/* Escritorio: iconos compactos con tooltip al pasar el ratón */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {unlockedAchievements.map((achievement) => (
          <div
            key={achievement.definition.id}
            className="group relative"
            title={achievement.definition.title}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/20 text-xl transition-colors hover:border-[var(--brand)]">
              {achievement.definition.emoji}
            </div>
            <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg group-hover:block">
              <p className="font-semibold">{achievement.definition.title}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                {achievement.definition.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </>
  );
}

interface AchievementsGridProps {
  achievements: UserAchievementWithMeta[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [selected, setSelected] = useState<UserAchievementWithMeta | null>(null);
  const groups = groupAchievementsByCategory(achievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const openDetail = useCallback((achievement: UserAchievementWithMeta) => {
    if (isMobileViewport()) setSelected(achievement);
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
            "grid h-16 w-16 place-items-center rounded-2xl text-4xl",
            unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--surface)] grayscale",
          )}
        >
          {definition.emoji}
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
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl",
              unlocked ? "bg-[var(--brand)]/20" : "bg-[var(--surface)] grayscale",
            )}
          >
            {definition.emoji}
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
