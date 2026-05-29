import { MOCK_TOURNAMENT } from "@/lib/mocks/tournament-teams";

/** Momento en que se cierra la edición del fantasy (inicio del torneo / primer partido). */
export function getFantasyLockAt(): Date {
  return new Date(MOCK_TOURNAMENT.startsAt);
}

export function isFantasyCompetitionLocked(now: Date = new Date()): boolean {
  return now.getTime() >= getFantasyLockAt().getTime();
}

export function isFantasyTeamEditable(
  team: { locked: boolean },
  now: Date = new Date(),
): boolean {
  return !team.locked && !isFantasyCompetitionLocked(now);
}

export function fantasyLockMessage(): string {
  const date = getFantasyLockAt().toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return `El fantasy se bloquea el ${date} (inicio del torneo). Ya no puedes modificar tu equipo ni tus predicciones.`;
}
