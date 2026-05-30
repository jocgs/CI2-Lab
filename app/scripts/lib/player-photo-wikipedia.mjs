/**
 * Fallback: miniatura de Wikipedia (en/es).
 */

const USER_AGENT = "TikiTakaFantasy/1.0 (university project; local dev)";

function lastName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? name;
}

function buildQueries(player) {
  const country = player.nationalTeamName.trim();
  return [
    `${player.name} ${country} footballer`,
    `${player.name} association football`,
    `${lastName(player.name)} ${country} football`,
  ];
}

async function searchThumb(query, wikiHost) {
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
  });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const src = page.thumbnail?.source;
    if (src && typeof src === "string") return src;
  }
  return null;
}

/** @param {{ name: string, nationalTeamName: string }} player */
export async function fetchPhotoUrlFromWikipedia(player) {
  for (const query of buildQueries(player)) {
    for (const host of ["en.wikipedia.org", "es.wikipedia.org"]) {
      const url = await searchThumb(query, host);
      if (url) return url;
    }
  }
  return null;
}
