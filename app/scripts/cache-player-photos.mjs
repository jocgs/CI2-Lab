/**
 * Precarga fotos de jugadores en public/imagenes/players/ vía TheSportsDB.
 * Uso: npm run fantasy:cache-photos
 * Opciones: --force (reintentar aunque exista caché) · --limit=N
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchPhotoUrlFromSportsDb } from "./lib/player-photo-sportsdb.mjs";
import { fetchPhotoUrlFromWikidata } from "./lib/player-photo-wikidata.mjs";
import { fetchPhotoUrlFromWikipedia } from "./lib/player-photo-wikipedia.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PLAYERS_PATH = resolve(ROOT, "src/lib/data/jugadores.json");
const CACHE_DIR = resolve(ROOT, "public/imagenes/players");
const DELAY_MS = 350;
const MIN_FILE_BYTES = 800;

const args = process.argv.slice(2);
const force = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const players = JSON.parse(readFileSync(PLAYERS_PATH, "utf8")).fantasyPlayers;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cachePath(playerId) {
  const safe = playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return resolve(CACHE_DIR, `${safe}.jpg`);
}

function hasValidCache(filePath) {
  if (!existsSync(filePath)) return false;
  if (force) return false;
  try {
    return statSync(filePath).size >= MIN_FILE_BYTES;
  } catch {
    return false;
  }
}

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true });
  let ok = 0;
  let skip = 0;
  let fail = 0;
  const toProcess = players.slice(0, Number.isFinite(limit) ? limit : players.length);

  console.log(`Precargando fotos de ${toProcess.length} jugadores…\n`);

  for (let i = 0; i < toProcess.length; i++) {
    const player = toProcess[i];
    const out = cachePath(player.id);

    if (hasValidCache(out)) {
      skip++;
      continue;
    }

    let url = await fetchPhotoUrlFromSportsDb(player);
    if (!url) url = await fetchPhotoUrlFromWikidata(player);
    if (!url) url = await fetchPhotoUrlFromWikipedia(player);
    if (!url) {
      fail++;
      if (fail <= 30 || fail % 50 === 0) {
        process.stdout.write(`✗ ${player.name} (${player.nationalTeamName})\n`);
      }
      await sleep(DELAY_MS);
      continue;
    }

    try {
      const img = await fetch(url, { headers: { Accept: "image/*" } });
      if (!img.ok) throw new Error(`HTTP ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());
      if (buf.length < MIN_FILE_BYTES) throw new Error("too small");
      writeFileSync(out, buf);
      ok++;
      if (ok % 50 === 0) {
        console.log(`  … ${i + 1}/${toProcess.length} (${ok} nuevas)`);
      }
    } catch {
      fail++;
      if (fail <= 30) {
        process.stdout.write(`✗ ${player.name} (descarga)\n`);
      }
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n✓ ${ok} guardadas · ${skip} ya en caché · ${fail} sin foto`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
