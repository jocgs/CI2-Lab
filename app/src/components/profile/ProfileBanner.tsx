import { getProfileTheme } from "@/lib/profile-themes";
import { clsx } from "@/lib/utils";

export function ProfileBanner({
  themeId,
  children,
  className,
}: {
  themeId?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const theme = getProfileTheme(themeId);
  const lightText = theme.id !== "yellow";

  return (
    <div
      className={clsx(
        "relative overflow-hidden px-6 py-8 sm:px-8",
        theme.bannerClass,
        lightText ? "text-white" : "text-slate-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function profileStatAccentClass(themeId?: string | null): string {
  return getProfileTheme(themeId).statAccentClass;
}
