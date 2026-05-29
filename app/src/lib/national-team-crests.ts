import crestManifest from "./data/national-team-crest-manifest.json";

const CREST_BASE = "/imagenes/national-crests";

const manifest = crestManifest as Record<string, string>;

/** Ruta pública del escudo cacheado en public/imagenes/national-crests/. */
export function getNationalTeamCrestUrl(teamId: string): string | undefined {
  const ext = manifest[teamId];
  if (!ext) return undefined;
  return `${CREST_BASE}/${teamId}${ext}`;
}

/** Iniciales de respaldo (p. ej. «ES» para España). */
export function getNationalTeamInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function enrichNationalTeamWithCrest<T extends { id: string; name: string; logoUrl?: string }>(
  team: T,
): T & { logoUrl?: string } {
  const crest = getNationalTeamCrestUrl(team.id);
  return crest ? { ...team, logoUrl: crest } : team;
}
