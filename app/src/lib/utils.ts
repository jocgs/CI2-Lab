/**
 * Helpers compartidos en toda la app.
 */
import type { Match } from "@/types/domain";

export type FormEntry = "W" | "D" | "L";

/**
 * Dado un array de partidos finalizados, devuelve un Map<teamId, FormEntry[]>
 * con los últimos 5 resultados de cada equipo (más reciente primero).
 */
export function computeTeamForms(finishedMatches: Match[]): Map<string, FormEntry[]> {
  const sorted = [...finishedMatches]
    .filter((m) => m.status === "FINISHED" && m.result)
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());

  const forms = new Map<string, FormEntry[]>();

  for (const match of sorted) {
    const r = match.result!;
    const homeEntry: FormEntry = r.homeGoals > r.awayGoals ? "W" : r.homeGoals < r.awayGoals ? "L" : "D";
    const awayEntry: FormEntry = r.awayGoals > r.homeGoals ? "W" : r.awayGoals < r.homeGoals ? "L" : "D";

    for (const [teamId, entry] of [[match.homeTeamId, homeEntry], [match.awayTeamId, awayEntry]] as [string, FormEntry][]) {
      const current = forms.get(teamId) ?? [];
      if (current.length < 5) {
        forms.set(teamId, [...current, entry]);
      }
    }
  }

  return forms;
}

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
