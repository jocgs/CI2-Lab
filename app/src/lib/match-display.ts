import type { Match } from "@/types/domain";

/** Partido programado cuyo kickoff ya pasó (datos no actualizados). */
export function isStaleScheduledMatch(match: Match, now = Date.now()): boolean {
  if (match.status !== "SCHEDULED") return false;
  return new Date(match.kickoffAt).getTime() < now;
}

export function filterDisplayMatches(
  matches: Match[],
  options?: { competitionId?: string; excludeStale?: boolean },
): Match[] {
  const excludeStale = options?.excludeStale !== false;
  return matches.filter((match) => {
    if (excludeStale && isStaleScheduledMatch(match)) return false;
    if (options?.competitionId && match.competitionId !== options.competitionId) {
      return false;
    }
    return true;
  });
}
