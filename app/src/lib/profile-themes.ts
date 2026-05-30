export type ProfileThemeId =
  | "default"
  | "red"
  | "navy"
  | "yellow"
  | "orange"
  | "pink"
  | "purple";

export interface ProfileThemeBrandColors {
  brand: string;
  brandStrong: string;
  brandSoft: string;
}

export interface ProfileTheme {
  id: ProfileThemeId;
  label: string;
  /** Gradiente del banner de perfil. */
  bannerClass: string;
  /** Tarjeta de estadística destacada. */
  statAccentClass: string;
  brandLight: ProfileThemeBrandColors;
  brandDark: ProfileThemeBrandColors;
}

export const PROFILE_THEMES: ProfileTheme[] = [
  {
    id: "default",
    label: "TikiTaka (actual)",
    bannerClass: "bg-gradient-to-r from-[var(--brand)] via-cyan-500 to-emerald-400",
    statAccentClass: "bg-gradient-to-br from-[var(--brand)] to-emerald-400",
    brandLight: { brand: "#10b981", brandStrong: "#047857", brandSoft: "#d1fae5" },
    brandDark: { brand: "#34d399", brandStrong: "#6ee7b7", brandSoft: "#064e3b" },
  },
  {
    id: "red",
    label: "Rojo",
    bannerClass: "bg-gradient-to-r from-red-700 via-rose-600 to-orange-600",
    statAccentClass: "bg-gradient-to-br from-red-600 to-rose-500",
    brandLight: { brand: "#dc2626", brandStrong: "#b91c1c", brandSoft: "#fee2e2" },
    brandDark: { brand: "#f87171", brandStrong: "#fca5a5", brandSoft: "#450a0a" },
  },
  {
    id: "navy",
    label: "Azul",
    bannerClass: "bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-400",
    statAccentClass: "bg-gradient-to-br from-sky-500 to-blue-500",
    brandLight: { brand: "#0ea5e9", brandStrong: "#0284c7", brandSoft: "#e0f2fe" },
    brandDark: { brand: "#38bdf8", brandStrong: "#7dd3fc", brandSoft: "#0c4a6e" },
  },
  {
    id: "yellow",
    label: "Amarillo",
    bannerClass: "bg-gradient-to-r from-amber-500 via-yellow-400 to-lime-400",
    statAccentClass: "bg-gradient-to-br from-amber-500 to-yellow-400",
    brandLight: { brand: "#eab308", brandStrong: "#a16207", brandSoft: "#fef9c3" },
    brandDark: { brand: "#facc15", brandStrong: "#fde047", brandSoft: "#422006" },
  },
  {
    id: "orange",
    label: "Naranja",
    bannerClass: "bg-gradient-to-r from-orange-700 via-amber-500 to-red-500",
    statAccentClass: "bg-gradient-to-br from-orange-600 to-amber-500",
    brandLight: { brand: "#ea580c", brandStrong: "#c2410c", brandSoft: "#ffedd5" },
    brandDark: { brand: "#fb923c", brandStrong: "#fdba74", brandSoft: "#431407" },
  },
  {
    id: "pink",
    label: "Rosa",
    bannerClass: "bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500",
    statAccentClass: "bg-gradient-to-br from-pink-500 to-rose-400",
    brandLight: { brand: "#db2777", brandStrong: "#be185d", brandSoft: "#fce7f3" },
    brandDark: { brand: "#f472b6", brandStrong: "#f9a8d4", brandSoft: "#500724" },
  },
  {
    id: "purple",
    label: "Morado",
    bannerClass: "bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-700",
    statAccentClass: "bg-gradient-to-br from-violet-700 to-purple-600",
    brandLight: { brand: "#7c3aed", brandStrong: "#6d28d9", brandSoft: "#ede9fe" },
    brandDark: { brand: "#a78bfa", brandStrong: "#c4b5fd", brandSoft: "#2e1065" },
  },
];

const themeById = new Map(PROFILE_THEMES.map((t) => [t.id, t]));

export function getProfileTheme(themeId?: string | null): ProfileTheme {
  if (themeId && themeById.has(themeId as ProfileThemeId)) {
    return themeById.get(themeId as ProfileThemeId)!;
  }
  return themeById.get("default")!;
}

export function isValidProfileThemeId(value: string): value is ProfileThemeId {
  return themeById.has(value as ProfileThemeId);
}

/** Banner claro (p. ej. amarillo): texto oscuro en pills y etiquetas. */
export function isLightProfileBanner(themeId?: string | null): boolean {
  return getProfileTheme(themeId).id === "yellow";
}

export function profileBannerMutedTextClass(themeId?: string | null): string {
  return isLightProfileBanner(themeId) ? "text-slate-800/75" : "text-white/75";
}

export function profileBannerSubtextClass(themeId?: string | null): string {
  return isLightProfileBanner(themeId) ? "text-slate-800/85" : "text-white/85";
}

export function profileBannerPillClass(themeId?: string | null): string {
  return isLightProfileBanner(themeId)
    ? "rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-slate-900 backdrop-blur"
    : "rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur";
}

export function profileBannerIconPillClass(themeId?: string | null): string {
  return isLightProfileBanner(themeId)
    ? "inline-flex items-center rounded-full bg-black/10 p-1 backdrop-blur"
    : "inline-flex items-center rounded-full bg-white/10 p-1 backdrop-blur";
}
