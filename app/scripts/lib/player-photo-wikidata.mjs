/**
 * Fotos vía Wikidata (P18) + Wikimedia Commons. Fallback cuando TheSportsDB no responde.
 */

const USER_AGENT = "TikiTakaFantasy/1.0 (university project; local dev)";

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

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function lastName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? name;
}

function isFootballEntity(description) {
  const d = normalize(description ?? "");
  if (NON_FOOTBALL_HINTS.some((h) => d.includes(h))) return false;
  return FOOTBALL_HINTS.some((h) => d.includes(h));
}

function nameMatches(playerName, label) {
  return normalize(playerName) === normalize(label ?? "");
}

function lastNameMatches(playerName, label) {
  const a = lastName(playerName);
  const b = lastName(label ?? "");
  return a.length >= 3 && a === b;
}

function countryHintMatches(description, nationalTeamName) {
  const d = normalize(description ?? "");
  const country = normalize(nationalTeamName);
  if (!country || country.length < 4) return false;
  const tokens = country.split(/\s+/).filter((t) => t.length >= 4);
  return tokens.some((t) => d.includes(t));
}

function scoreResult(player, hit) {
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

function isAcceptable({ score, football, exactName, lastNameOk, country }) {
  if (!football || score < 45) return false;
  if (exactName) return true;
  if (lastNameOk && country) return true;
  if (score >= 75) return true;
  return false;
}

function commonsThumbUrl(filename, width = 400) {
  const encoded = encodeURIComponent(filename.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${width}`;
}

async function wikidataSearch(term, language) {
  const res = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=${language}&format=json&limit=10`,
    { headers: { "User-Agent": USER_AGENT } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.search ?? [];
}

async function getImageFilename(entityId) {
  const res = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`,
    { headers: { "User-Agent": USER_AGENT } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const entity = data.entities?.[entityId];
  const filename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return typeof filename === "string" ? filename : null;
}

function buildSearchTerms(player) {
  const ln = lastName(player.name);
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

/** @param {{ name: string, nationalTeamName: string }} player */
export async function fetchPhotoUrlFromWikidata(player) {
  const seen = new Set();

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
