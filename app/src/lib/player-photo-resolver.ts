import type { FantasyPlayer } from "@/types/fantasy";

/** URLs del JSON que son plantillas inventadas (no existen en la red). */
export function isPlaceholderPhotoUrl(url: string | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return u.includes("images.fifa.com") || u.includes("example.com");
}

/** Ruta del proxy interno que resuelve y cachea la foto. */
export function getPlayerPhotoProxyPath(playerId: string): string {
  return `/api/player-photo/${encodeURIComponent(playerId)}`;
}

const NATIONALITY_ALIASES: Record<string, string[]> = {
  mexico: ["mexico", "méxico"],
  usa: ["usa", "united states", "estados unidos", "u.s.a."],
  canada: ["canada", "canadá"],
  argentina: ["argentina"],
  brazil: ["brazil", "brasil"],
  england: ["england", "inglaterra"],
  spain: ["spain", "españa", "espana"],
  france: ["france", "francia"],
  germany: ["germany", "alemania"],
  portugal: ["portugal"],
  netherlands: ["netherlands", "holanda", "países bajos", "paises bajos"],
  italy: ["italy", "italia"],
  japan: ["japan", "japón", "japon"],
  australia: ["australia"],
  morocco: ["morocco", "marruecos"],
  croatia: ["croatia", "croacia"],
  "new zealand": ["new zealand", "nueva zelanda"],
};

function normalizeCountry(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function countryMatches(teamId: string, teamName: string, sportsDbNationality: string): boolean {
  const db = normalizeCountry(sportsDbNationality);
  const aliases = NATIONALITY_ALIASES[teamId] ?? [normalizeCountry(teamName)];
  return aliases.some((a) => db.includes(a) || a.includes(db));
}

interface SportsDbPlayer {
  strPlayer?: string;
  strNationality?: string;
  strThumb?: string;
  strCutout?: string;
  relevance?: string;
}

/**
 * Busca foto en TheSportsDB (API pública gratuita) por nombre del jugador.
 * Prefiere coincidencia de nacionalidad con la selección del catálogo.
 */
export async function fetchPhotoUrlFromSportsDb(
  player: FantasyPlayer,
): Promise<string | null> {
  const query = encodeURIComponent(player.name.trim().replace(/\s+/g, "_"));
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${query}`,
    { next: { revalidate: 60 * 60 * 24 * 7 } },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { player?: SportsDbPlayer[] };
  const candidates = data.player ?? [];
  if (candidates.length === 0) return null;

  const sorted = [...candidates].sort(
    (a, b) => Number(b.relevance ?? 0) - Number(a.relevance ?? 0),
  );

  const match =
    sorted.find((c) =>
      c.strNationality
        ? countryMatches(player.nationalTeamId, player.nationalTeamName, c.strNationality)
        : false,
    ) ?? sorted[0];

  // strThumb suele ser retrato (mejor para avatar circular que el cutout de cuerpo entero)
  return match.strThumb?.trim() || match.strCutout?.trim() || null;
}

/** Si la URL del JSON es externa y válida, úsala; si no, resuelve vía SportsDB. */
export async function resolvePlayerPhotoSourceUrl(
  player: FantasyPlayer,
): Promise<string | null> {
  const catalogUrl = player.photoUrl?.trim();
  if (catalogUrl && !isPlaceholderPhotoUrl(catalogUrl)) {
    return catalogUrl;
  }
  return fetchPhotoUrlFromSportsDb(player);
}
