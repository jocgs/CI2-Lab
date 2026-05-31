/** Ruta de predicciones del torneo (Bola de cristal), opcionalmente por liga. */
export function bolaDeCristalHref(leagueId?: string | null): string {
  if (leagueId) return `/fantasy/bola-de-cristal?league=${leagueId}`;
  return "/fantasy/bola-de-cristal";
}

/** Predicción del cuadro eliminatorio del Mundial. */
export function worldCupBracketHref(): string {
  return "/fantasy/bracket";
}

/** Vuelta al fantasy tras guardar predicciones. */
export function fantasyReturnHref(leagueId?: string | null): string {
  if (leagueId) return `/fantasy/my-team?league=${leagueId}`;
  return "/fantasy/my-team";
}
