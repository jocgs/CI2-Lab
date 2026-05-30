import type { FantasyPlayer } from "@/types/fantasy";

/** URLs del JSON que son plantillas inventadas (no existen en la red). */
export function isPlaceholderPhotoUrl(url: string | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return u.includes("images.fifa.com") || u.includes("example.com");
}

function safePlayerId(playerId: string): string {
  return playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Ruta estática si la foto ya está cacheada en /public. */
export function getPlayerPhotoStaticPath(playerId: string): string {
  return `/imagenes/players/${safePlayerId(playerId)}.jpg`;
}

/** Ruta del proxy interno que resuelve y cachea la foto. */
export function getPlayerPhotoProxyPath(playerId: string): string {
  return `/api/player-photo/${encodeURIComponent(playerId)}`;
}

const NATIONALITY_ALIASES: Record<string, string[]> = {
  algeria: ["algeria", "argelia", "algerian"],
  argentina: ["argentina", "argentine"],
  australia: ["australia", "australian"],
  austria: ["austria", "austrian"],
  belgium: ["belgium", "belgica", "belgian"],
  bosnia: ["bosnia", "bosnian", "herzegovina"],
  brazil: ["brazil", "brasil", "brazilian"],
  canada: ["canada", "canadian"],
  cape_verde: ["cape verde", "cabo verde"],
  colombia: ["colombia", "colombian"],
  croatia: ["croatia", "croacia", "croatian"],
  curacao: ["curacao", "curazao", "curaçao"],
  czech_republic: ["czech", "checa", "czech republic"],
  dr_congo: ["dr congo", "rd congo", "congo", "democratic republic"],
  ecuador: ["ecuador", "ecuadorian"],
  egypt: ["egypt", "egipto", "egyptian"],
  england: ["england", "inglaterra", "english"],
  france: ["france", "francia", "french"],
  germany: ["germany", "alemania", "german"],
  ghana: ["ghana", "ghanaian"],
  haiti: ["haiti", "haitian"],
  iran: ["iran", "irani", "iranian"],
  iraq: ["iraq", "irak", "iraqi"],
  ivory_coast: ["ivory coast", "costa de marfil", "ivorian", "ivoire"],
  japan: ["japan", "japon", "japanese"],
  jordan: ["jordan", "jordania", "jordanian"],
  mexico: ["mexico", "mexican"],
  morocco: ["morocco", "marruecos", "moroccan"],
  netherlands: ["netherlands", "holanda", "paises bajos", "dutch"],
  new_zealand: ["new zealand", "nueva zelanda"],
  norway: ["norway", "noruega", "norwegian"],
  panama: ["panama", "panamanian"],
  paraguay: ["paraguay", "paraguayan"],
  portugal: ["portugal", "portuguese"],
  qatar: ["qatar", "catar", "qatari"],
  saudi_arabia: ["saudi", "arabia saudi", "saudi arabian"],
  scotland: ["scotland", "escocia", "scottish"],
  senegal: ["senegal", "senegalese"],
  south_africa: ["south africa", "sudafrica", "south african"],
  south_korea: ["south korea", "korea", "corea", "korean"],
  spain: ["spain", "espana", "spanish"],
  sweden: ["sweden", "suecia", "swedish"],
  switzerland: ["switzerland", "suiza", "swiss"],
  tunisia: ["tunisia", "tunez", "tunisian"],
  turkey: ["turkey", "turquia", "turkish"],
  uruguay: ["uruguay", "uruguayan"],
  usa: ["usa", "united states", "estados unidos", "american", "u.s.a."],
  uzbekistan: ["uzbekistan", "uzbek"],
};

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function normalizeText(value: string): string {
  return stripAccents(value).toLowerCase().trim();
}

function countryMatches(teamId: string, teamName: string, sportsDbNationality: string): boolean {
  const db = normalizeText(sportsDbNationality);
  const aliases = NATIONALITY_ALIASES[teamId] ?? [normalizeText(teamName)];
  return aliases.some((a) => db.includes(a) || a.includes(db));
}

interface SportsDbPlayer {
  strPlayer?: string;
  strNationality?: string;
  strThumb?: string;
  strCutout?: string;
  relevance?: string;
}

function buildSearchQueries(name: string): string[] {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? trimmed;
  const queries = [trimmed, stripAccents(trimmed), last, stripAccents(last)];

  if (parts.length >= 2) {
    queries.push(`${parts[0]} ${last}`, stripAccents(`${parts[0]} ${last}`));
  }

  return [...new Set(queries.filter((q) => q.length > 1))];
}

function photoFromCandidate(candidate: SportsDbPlayer): string | null {
  return candidate.strThumb?.trim() || candidate.strCutout?.trim() || null;
}

function pickBestCandidate(
  player: FantasyPlayer,
  candidates: SportsDbPlayer[],
): SportsDbPlayer | null {
  if (candidates.length === 0) return null;

  const target = normalizeText(player.name);
  const targetParts = target.split(/\s+/);

  const scored = candidates.map((candidate) => {
    let score = Number(candidate.relevance ?? 0);
    const candidateName = normalizeText(candidate.strPlayer ?? "");

    if (candidateName === target) score += 120;
    else if (candidateName.includes(target) || target.includes(candidateName)) score += 60;
    else if (targetParts.every((part) => candidateName.includes(part))) score += 40;

    if (
      candidate.strNationality &&
      countryMatches(player.nationalTeamId, player.nationalTeamName, candidate.strNationality)
    ) {
      score += 80;
    }

    if (candidate.strThumb) score += 15;

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.candidate ?? null;
}

let sportsDbChain: Promise<void> = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serializa peticiones a TheSportsDB para evitar rate-limit con muchas fotos a la vez. */
async function throttledSportsDbFetch(url: string): Promise<Response | null> {
  const task = async () => {
    await sleep(280);
    return fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
  };

  const result = sportsDbChain.then(task, task);
  sportsDbChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function searchSportsDbPlayers(query: string): Promise<SportsDbPlayer[]> {
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`;
  const res = await throttledSportsDbFetch(url);
  if (!res?.ok) return [];

  const text = await res.text();
  if (!text.trimStart().startsWith("{")) return [];

  try {
    const data = JSON.parse(text) as { player?: SportsDbPlayer[] };
    return data.player ?? [];
  } catch {
    return [];
  }
}

/**
 * Busca foto en TheSportsDB (API pública gratuita) por nombre del jugador.
 * Prueba varias variantes del nombre y prefiere coincidencia de nacionalidad.
 */
export async function fetchPhotoUrlFromSportsDb(
  player: FantasyPlayer,
): Promise<string | null> {
  const candidates: SportsDbPlayer[] = [];
  const tried = new Set<string>();

  for (const query of buildSearchQueries(player.name)) {
    const key = query.toLowerCase();
    if (tried.has(key)) continue;
    tried.add(key);

    const batch = await searchSportsDbPlayers(query);
    if (batch.length === 0) continue;

    candidates.push(...batch);
    const match = pickBestCandidate(player, candidates);
    const photo = match ? photoFromCandidate(match) : null;
    if (photo) return photo;
  }

  const fallback = pickBestCandidate(player, candidates);
  return fallback ? photoFromCandidate(fallback) : null;
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
