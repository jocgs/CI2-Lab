import { getProfileTheme, type ProfileThemeId } from "@/lib/profile-themes";

/** CSS que sobreescribe --brand* según el color de perfil del usuario. */
export function getProfileThemeCssBlock(themeId: ProfileThemeId): string {
  if (themeId === "default") return "";

  const { brandLight, brandDark } = getProfileTheme(themeId);
  const sel = `html[data-profile-theme="${themeId}"]`;

  return `
${sel} {
  --brand: ${brandLight.brand};
  --brand-strong: ${brandLight.brandStrong};
  --brand-soft: ${brandLight.brandSoft};
}
@media (prefers-color-scheme: dark) {
  ${sel}:not(.light) {
    --brand: ${brandDark.brand};
    --brand-strong: ${brandDark.brandStrong};
    --brand-soft: ${brandDark.brandSoft};
  }
}
${sel}.dark {
  --brand: ${brandDark.brand};
  --brand-strong: ${brandDark.brandStrong};
  --brand-soft: ${brandDark.brandSoft};
}
`.trim();
}
