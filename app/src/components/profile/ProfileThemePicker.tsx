"use client";

import { PROFILE_THEMES, type ProfileThemeId } from "@/lib/profile-themes";
import { clsx } from "@/lib/utils";

export function ProfileThemePicker({
  defaultThemeId = "default",
}: {
  defaultThemeId?: ProfileThemeId | string | null;
}) {
  const selected =
    PROFILE_THEMES.find((t) => t.id === defaultThemeId)?.id ?? "default";

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Color del perfil</legend>
      <p className="text-xs text-[var(--muted)]">
        Elige el degradado del banner en tu perfil y perfil público.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {PROFILE_THEMES.map((theme) => (
          <label
            key={theme.id}
            className={clsx(
              "cursor-pointer overflow-hidden rounded-xl border-2 transition-shadow",
              selected === theme.id
                ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30"
                : "border-[var(--border)] hover:border-[var(--muted)]",
            )}
          >
            <input
              type="radio"
              name="profileThemeId"
              value={theme.id}
              defaultChecked={selected === theme.id}
              className="sr-only"
            />
            <div className={clsx("h-12 w-full", theme.bannerClass)} />
            <span className="block bg-[var(--surface)] px-2 py-1.5 text-center text-[11px] font-medium leading-tight">
              {theme.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
