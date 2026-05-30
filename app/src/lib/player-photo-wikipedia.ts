/**
 * Fallback: miniatura de Wikipedia (en/es).
 */

import type { FantasyPlayer } from "@/types/fantasy";

const USER_AGENT = "TikiTakaFantasy/1.0 (university project)";

function playerLastName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? name;
}

function buildQueries(player: FantasyPlayer): string[] {
  const country = player.nationalTeamName.trim();
  return [
    `${player.name} ${country} footballer`,
    `${player.name} association football`,
    `${playerLastName(player.name)} ${country} football`,
  ];
}

async function searchThumb(query: string, wikiHost: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "3",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "400",
    format: "json",
    origin: "*",
  });
  const res = await fetch(`https://${wikiHost}/w/api.php?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 60 * 60 * 24 * 14 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
  };
  const pages = data.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const src = page.thumbnail?.source;
    if (src) return src;
  }
  return null;
}

export async function fetchPhotoUrlFromWikipedia(player: FantasyPlayer): Promise<string | null> {
  for (const query of buildQueries(player)) {
    for (const host of ["en.wikipedia.org", "es.wikipedia.org"]) {
      const url = await searchThumb(query, host);
      if (url) return url;
    }
  }
  return null;
}
