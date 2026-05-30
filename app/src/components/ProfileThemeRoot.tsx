import { getProfileThemeCssBlock } from "@/lib/profile-theme-css";
import { isValidProfileThemeId, type ProfileThemeId } from "@/lib/profile-themes";

export function ProfileThemeRoot({ themeId }: { themeId: ProfileThemeId }) {
  if (themeId === "default") return null;

  const css = getProfileThemeCssBlock(themeId);
  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function resolveProfileThemeId(
  fromUser?: string | null,
  fromCookie?: string | null,
): ProfileThemeId {
  if (fromUser && isValidProfileThemeId(fromUser)) return fromUser;
  if (fromCookie && isValidProfileThemeId(fromCookie)) return fromCookie;
  return "default";
}
