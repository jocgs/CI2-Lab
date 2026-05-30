import type { FantasyPlayer } from "@/types/fantasy";
import { fetchPhotoUrlFromWikidata } from "@/lib/player-photo-wikidata";
import { fetchPhotoUrlFromWikipedia } from "@/lib/player-photo-wikipedia";

/** URLs del JSON que son plantillas inventadas (no existen en la red). */
export function isPlaceholderPhotoUrl(url: string | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return u.includes("images.fifa.com") || u.includes("example.com");
}

function safePlayerId(playerId: string): string {
  return playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Ruta estática si la foto ya está en public/imagenes/players/. */
export function getPlayerPhotoStaticPath(playerId: string): string {
  return `/imagenes/players/${safePlayerId(playerId)}.jpg`;
}

/** Ruta del proxy interno que resuelve y cachea la foto. */
export function getPlayerPhotoProxyPath(playerId: string): string {
  return `/api/player-photo/${encodeURIComponent(playerId)}`;
}

const NATIONALITY_ALIASES: Record<string, string[]> = {
  mexico: ["mexico", "méxico"],
  usa: ["usa", "united states", "estados unidos", "u.s.a.", "america"],
  canada: ["canada", "canadá"],
  argentina: ["argentina"],
  brazil: ["brazil", "brasil"],
  england: ["england", "inglaterra", "english"],
  spain: ["spain", "españa", "espana", "spanish"],
  france: ["france", "francia", "french"],
  germany: ["germany", "alemania", "german"],
  portugal: ["portugal", "portuguese"],
  netherlands: ["netherlands", "holanda", "países bajos", "paises bajos", "dutch"],
  italy: ["italy", "italia", "italian"],
  japan: ["japan", "japón", "japon", "japanese"],
  australia: ["australia", "australian"],
  morocco: ["morocco", "marruecos", "moroccan"],
  croatia: ["croatia", "croacia", "croatian"],
  belgium: ["belgium", "bélgica", "belgica", "belgian"],
  colombia: ["colombia", "colombian"],
  uruguay: ["uruguay", "uruguayan"],
  ecuador: ["ecuador", "ecuadorian"],
  paraguay: ["paraguay", "paraguayan"],
  senegal: ["senegal", "senegalese"],
  ghana: ["ghana", "ghanaian"],
  ivory_coast: ["ivory coast", "côte d'ivoire", "cote d'ivoire", "ivorian"],
  egypt: ["egypt", "egipto", "egyptian"],
  algeria: ["algeria", "argelia", "algerian"],
  tunisia: ["tunisia", "túnez", "tunisian"],
  south_korea: ["south korea", "korea republic", "corea del sur", "korean"],
  iran: ["iran", "irán", "iranian"],
  iraq: ["iraq", "irak", "iraqi"],
  saudi_arabia: ["saudi arabia", "arabia saudí", "saudi"],
  qatar: ["qatar", "catar", "qatari"],
  uzbekistan: ["uzbekistan", "uzbek"],
  jordan: ["jordan", "jordania", "jordanian"],
  switzerland: ["switzerland", "suiza", "swiss"],
  austria: ["austria", "austrian"],
  sweden: ["sweden", "suecia", "swedish"],
  norway: ["norway", "noruega", "norwegian"],
  scotland: ["scotland", "escocia", "scottish"],
  turkey: ["turkey", "turquía", "turkish"],
  czech_republic: ["czech republic", "czechia", "república checa", "czech"],
  panama: ["panama", "panamá", "panamanian"],
  haiti: ["haiti", "haitian"],
  curacao: ["curacao", "curaçao", "curazao"],
  south_africa: ["south africa", "sudáfrica", "south african"],
  new_zealand: ["new zealand", "nueva zelanda", "zealand"],
  dr_congo: ["dr congo", "congo dr", "democratic republic", "rd congo", "congo"],
  cape_verde: ["cape verde", "cabo verde"],
  bosnia: ["bosnia", "bosnia and herzegovina"],
  costa_rica: ["costa rica", "costarican"],
  chile: ["chile", "chilean"],
  nigeria: ["nigeria", "nigerian"],
  cameroon: ["cameroon", "cameroonian"],
  poland: ["poland", "polonia", "polish"],
  wales: ["wales", "gales", "welsh"],
  serbia: ["serbia", "serbian"],
  ukraine: ["ukraine", "ucrania", "ukrainian"],
  denmark: ["denmark", "dinamarca", "danish"],
  jamaica: ["jamaica", "jamaican"],
  honduras: ["honduras", "honduran"],
};

function normalizeCountry(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function nationalityAliases(teamId: string, teamName: string): string[] {
  const keys = [teamId, teamId.replace(/_/g, " ")] as const;
  for (const key of keys) {
    const aliases = NATIONALITY_ALIASES[key as keyof typeof NATIONALITY_ALIASES];
    if (aliases) return aliases;
  }
  return [normalizeCountry(teamName)];
}

function countryMatches(teamId: string, teamName: string, sportsDbNationality: string): boolean {
  const db = normalizeCountry(sportsDbNationality);
  return nationalityAliases(teamId, teamName).some((a) => db.includes(a) || a.includes(db));
}

interface SportsDbPlayer {
  strPlayer?: string;
  strNationality?: string;
  strThumb?: string;
  strCutout?: string;
  relevance?: string;
}

function nameScore(playerName: string, strPlayer?: string): number {
  const a = normalizeCountry(playerName);
  const b = normalizeCountry(strPlayer ?? "");
  if (!b) return 0;
  if (a === b) return 100;
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  if (aLast && aLast === bLast) return 70;
  if (b.includes(a) || a.includes(b)) return 50;
  return 0;
}

function buildSearchQueries(player: FantasyPlayer): string[] {
  const trimmed = player.name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const countryHint = player.nationalTeamName.trim();
  const queries = new Set([
    trimmed.replace(/\s+/g, "_"),
    trimmed,
    trimmed.replace(/\./g, ""),
    `${trimmed} ${countryHint}`,
  ]);
  if (parts.length >= 2) {
    queries.add(parts[parts.length - 1]!);
    queries.add(`${parts[0]}_${parts[parts.length - 1]}`);
    queries.add(`${parts[0]} ${parts[parts.length - 1]}`);
    queries.add(`${parts[0]} ${parts[parts.length - 1]} ${countryHint}`);
  }
  if (parts.length >= 3) {
    queries.add(parts.slice(-2).join("_"));
    queries.add(parts.slice(-2).join(" "));
  }
  return [...queries];
}

async function searchPlayers(query: string): Promise<SportsDbPlayer[]> {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`,
    { next: { revalidate: 60 * 60 * 24 * 7 } },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { player?: SportsDbPlayer[] };
  return data.player ?? [];
}

/**
 * Busca foto en TheSportsDB con varias variantes del nombre y filtro por nacionalidad.
 */
export async function fetchPhotoUrlFromSportsDb(
  player: FantasyPlayer,
): Promise<string | null> {
  const queries = buildSearchQueries(player);
  let bestUrl: string | null = null;
  let bestScore = 0;

  for (const query of queries) {
    const candidates = await searchPlayers(query);
    if (candidates.length === 0) continue;

    for (const c of candidates) {
      const url = c.strThumb?.trim() || c.strCutout?.trim();
      if (!url) continue;
      const ns = nameScore(player.name, c.strPlayer);
      const natOk = c.strNationality
        ? countryMatches(player.nationalTeamId, player.nationalTeamName, c.strNationality)
        : false;
      const score = ns + (natOk ? 40 : 0);
      const acceptable = ns >= 70 || (ns >= 50 && natOk) || (ns >= 100);
      if (acceptable && score > bestScore) {
        bestScore = score;
        bestUrl = url;
      }
    }

    if (bestScore >= 90) break;
  }

  return bestUrl;
}

/** Si la URL del JSON es externa y válida, úsala; si no, resuelve vía SportsDB. */
export async function resolvePlayerPhotoSourceUrl(
  player: FantasyPlayer,
): Promise<string | null> {
  const catalogUrl = player.photoUrl?.trim();
  if (catalogUrl && !isPlaceholderPhotoUrl(catalogUrl)) {
    return catalogUrl;
  }
  const fromSportsDb = await fetchPhotoUrlFromSportsDb(player);
  if (fromSportsDb) return fromSportsDb;
  const fromWikidata = await fetchPhotoUrlFromWikidata(player);
  if (fromWikidata) return fromWikidata;
  return fetchPhotoUrlFromWikipedia(player);
}
