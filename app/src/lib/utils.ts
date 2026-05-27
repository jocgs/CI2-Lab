/**
 * Helpers compartidos en toda la app.
 */

export function clsx(...values: Array<string | undefined | false | null>): string {
  return values.filter(Boolean).join(" ");
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatKickoff(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

const RELATIVE = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });

export function relativeFromNow(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const absMin = Math.abs(diffMin);
  if (absMin < 60) return RELATIVE.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return RELATIVE.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  return RELATIVE.format(diffDay, "day");
}
