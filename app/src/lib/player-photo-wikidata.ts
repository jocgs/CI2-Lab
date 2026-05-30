/**
 * Fotos vía Wikidata (P18) + Wikimedia Commons. Fallback cuando TheSportsDB no responde.
 */

import type { FantasyPlayer } from "@/types/fantasy";

const USER_AGENT = "TikiTakaFantasy/1.0 (university project)";

const FOOTBALL_HINTS = [
  "association football",
  "football player",
  "footballer",
  "soccer",
  "fútbol",
  "futbol",
  "international football",
  "men's football",
  "women's football",
  "goalkeeper",
  "midfielder",
  "defender",
  "forward",
];

const NON_FOOTBALL_HINTS = [
  "american football",
  "basketball",
  "rugby union",
  "cricket",
  "baseball",
  "ice hockey",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function playerLastName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? name;
}

function isFootballEntity(description?: string): boolean {
  const d = normalize(description ?? "");
  if (NON_FOOTBALL_HINTS.some((h) => d.includes(h))) return false;
  return FOOTBALL_HINTS.some((h) => d.includes(h));
}

function nameMatches(playerName: string, label?: string): boolean {
  return normalize(playerName) === normalize(label ?? "");
}

function lastNameMatches(playerName: string, label?: string): boolean {
  const a = playerLastName(playerName);
  const b = playerLastName(label ?? "");
  return a.length >= 3 && a === b;
}

function countryHintMatches(description: string | undefined, nationalTeamName: string): boolean {
  const d = normalize(description ?? "");
  const country = normalize(nationalTeamName);
  if (!country || country.length < 4) return false;
  const tokens = country.split(/\s+/).filter((t) => t.length >= 4);
  return tokens.some((t) => d.includes(t));
}

interface ScoredHit {
  score: number;
  football: boolean;
  exactName: boolean;
  lastNameOk: boolean;
  country: boolean;
}

function scoreResult(player: FantasyPlayer, hit: { label?: string; description?: string }): ScoredHit {
  const football = isFootballEntity(hit.description);
  const exactName = nameMatches(player.name, hit.label);
  const lastNameOk = lastNameMatches(player.name, hit.label);
  const country = countryHintMatches(hit.description, player.nationalTeamName);
  let score = 0;
  if (football) score += 30;
  if (exactName) score += 50;
  else if (lastNameOk) score += 35;
  if (country) score += 25;
  return { score, football, exactName, lastNameOk, country };
}

function isAcceptable(s: ScoredHit): boolean {
  if (!s.football || s.score < 45) return false;
  if (s.exactName) return true;
  if (s.lastNameOk && s.country) return true;
  if (s.score >= 75) return true;
  return false;
}

function commonsThumbUrl(filename: string, width = 400): string {
  const encoded = encodeURIComponent(filename.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${width}`;
}

interface WikidataSearchHit {
  id: string;
  label?: string;
  description?: string;
}

async function wikidataSearch(term: string, language: string): Promise<WikidataSearchHit[]> {
  const res = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=${language}&format=json&limit=10`,
    {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 60 * 60 * 24 * 30 },
    },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { search?: WikidataSearchHit[] };
  return data.search ?? [];
}

async function getImageFilename(entityId: string): Promise<string | null> {
  const res = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`,
    {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 60 * 60 * 24 * 30 },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    entities?: Record<string, { claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } }>;
  };
  const filename = data.entities?.[entityId]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return typeof filename === "string" ? filename : null;
}

function buildSearchTerms(player: FantasyPlayer): string[] {
  const ln = playerLastName(player.name);
  const country = player.nationalTeamName.trim();
  return [
    `${player.name} association football`,
    `${player.name} footballer`,
    `${player.name} ${country}`,
    `${ln} ${country} footballer`,
    `${ln} ${country} football`,
    player.name,
  ];
}

export async function fetchPhotoUrlFromWikidata(player: FantasyPlayer): Promise<string | null> {
  const seen = new Set<string>();

  for (const term of buildSearchTerms(player)) {
    for (const lang of ["en", "es"]) {
      const results = await wikidataSearch(term, lang);
      const ranked = results
        .map((r) => ({ r, ...scoreResult(player, r) }))
        .filter((x) => isAcceptable(x))
        .sort((a, b) => b.score - a.score);

      for (const { r } of ranked) {
        if (seen.has(r.id)) continue;
        seen.add(r.id);
        const filename = await getImageFilename(r.id);
        if (filename) return commonsThumbUrl(filename);
      }
    }
  }

  return null;
}
