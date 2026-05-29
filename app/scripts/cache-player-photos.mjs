/**
 * Precarga fotos de jugadores en public/imagenes/players/ vía la API interna.
 * Ejecutar con el servidor de desarrollo en marcha: npm run dev (otra terminal) + npm run fantasy:cache-photos
 *
 * O usa directamente TheSportsDB sin servidor (más lento pero autónomo).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PLAYERS_PATH = resolve(ROOT, "src/lib/data/jugadores.json");
const CACHE_DIR = resolve(ROOT, "public/imagenes/players");
const DELAY_MS = 350;

const players = JSON.parse(readFileSync(PLAYERS_PATH, "utf8")).fantasyPlayers;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cachePath(playerId) {
  const safe = playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return resolve(CACHE_DIR, `${safe}.jpg`);
}

async function fetchFromSportsDb(player) {
  const query = encodeURIComponent(player.name.trim().replace(/\s+/g, "_"));
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${query}`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  const list = data.player ?? [];
  if (!list.length) return null;
  const p = list[0];
  return p.strThumb || p.strCutout || null;
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
      process.stdout.write(`✗ ${player.name}\n`);
      await sleep(DELAY_MS);
      continue;
    }

    try {
      const img = await fetch(url);
      if (!img.ok) throw new Error(`HTTP ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());
      writeFileSync(out, buf);
      ok++;
      if ((ok + fail) % 25 === 0) {
        console.log(`  … ${i + 1}/${players.length}`);
      }
    } catch {
      fail++;
      process.stdout.write(`✗ ${player.name}\n`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n✓ ${ok} guardadas · ${skip} ya en caché · ${fail} sin foto`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
