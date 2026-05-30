/**
 * Precarga fotos de jugadores en public/imagenes/players/ vía TheSportsDB.
 * Ejecutar: npm run fantasy:cache-photos
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PLAYERS_PATH = resolve(ROOT, "src/lib/data/jugadores.json");
const CACHE_DIR = resolve(ROOT, "public/imagenes/players");
const DELAY_MS = 320;

const NATIONALITY_ALIASES = {
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

const players = JSON.parse(readFileSync(PLAYERS_PATH, "utf8")).fantasyPlayers;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripAccents(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function normalizeText(value) {
  return stripAccents(value).toLowerCase().trim();
}

function countryMatches(teamId, teamName, sportsDbNationality) {
  const db = normalizeText(sportsDbNationality);
  const aliases = NATIONALITY_ALIASES[teamId] ?? [normalizeText(teamName)];
  return aliases.some((a) => db.includes(a) || a.includes(db));
}

function buildSearchQueries(name) {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? trimmed;
  const queries = [trimmed, stripAccents(trimmed), last, stripAccents(last)];
  if (parts.length >= 2) {
    queries.push(`${parts[0]} ${last}`, stripAccents(`${parts[0]} ${last}`));
  }
  return [...new Set(queries.filter((q) => q.length > 1))];
}

function pickBestCandidate(player, candidates) {
  if (!candidates.length) return null;
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

function cachePath(playerId) {
  const safe = playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return resolve(CACHE_DIR, `${safe}.jpg`);
}

async function searchSportsDbPlayers(query) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return [];
  const text = await res.text();
  if (!text.trimStart().startsWith("{")) return [];
  try {
    const data = JSON.parse(text);
    return data.player ?? [];
  } catch {
    return [];
  }
}

async function fetchFromSportsDb(player) {
  const candidates = [];
  const tried = new Set();

  for (const query of buildSearchQueries(player.name)) {
    const key = query.toLowerCase();
    if (tried.has(key)) continue;
    tried.add(key);

    const batch = await searchSportsDbPlayers(query);
    if (!batch.length) continue;

    candidates.push(...batch);
    const match = pickBestCandidate(player, candidates);
    const photo = match?.strThumb || match?.strCutout || null;
    if (photo) return photo;
  }

  const fallback = pickBestCandidate(player, candidates);
  return fallback?.strThumb || fallback?.strCutout || null;
}

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true });
  let ok = 0;
  let skip = 0;
  let fail = 0;

  console.log(`Precargando fotos de ${players.length} jugadores…\n`);

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const out = cachePath(player.id);

    if (existsSync(out)) {
      skip++;
      continue;
    }

    const url = await fetchFromSportsDb(player);
    if (!url) {
      fail++;
      if (fail <= 20) process.stdout.write(`✗ ${player.name}\n`);
      await sleep(DELAY_MS);
      continue;
    }

    try {
      const img = await fetch(url);
      if (!img.ok) throw new Error(`HTTP ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());
      if (buf.length < 200) throw new Error("too small");
      writeFileSync(out, buf);
      ok++;
      if ((ok + fail) % 25 === 0) {
        console.log(`  … ${i + 1}/${players.length}`);
      }
    } catch {
      fail++;
      if (fail <= 20) process.stdout.write(`✗ ${player.name}\n`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n✓ ${ok} guardadas · ${skip} ya en caché · ${fail} sin foto`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
