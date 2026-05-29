/**
 * Descarga escudos de selecciones a public/imagenes/national-crests/{id}.svg|.png
 * Ejecutar: npm run fantasy:cache-crests
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCES_PATH = resolve(ROOT, "src/lib/data/national-team-crest-sources.json");
const CACHE_DIR = resolve(ROOT, "public/imagenes/national-crests");
const DELAY_MS = 200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extFromUrl(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".png")) return ".png";
  if (path.endsWith(".webp")) return ".webp";
  return ".svg";
}

async function main() {
  const sources = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
  mkdirSync(CACHE_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;

  const ids = Object.keys(sources).sort();
  console.log(`Descargando ${ids.length} escudos…\n`);

  for (const id of ids) {
    const { sourceUrl } = sources[id];
    const ext = extFromUrl(sourceUrl);
    const out = resolve(CACHE_DIR, `${id}${ext}`);

    for (const oldExt of [".svg", ".png", ".webp"]) {
      const oldPath = resolve(CACHE_DIR, `${id}${oldExt}`);
      if (oldPath !== out && existsSync(oldPath)) unlinkSync(oldPath);
    }

    try {
      const res = await fetch(sourceUrl, { headers: { Accept: "image/*" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 80) throw new Error("respuesta demasiado pequeña");
      writeFileSync(out, buf);
      ok++;
      process.stdout.write(`✓ ${id}\n`);
    } catch (e) {
      fail++;
      process.stdout.write(`✗ ${id} (${e.message})\n`);
    }

    await sleep(DELAY_MS);
  }

  // Manifest con extensión real por equipo (para el resolver en runtime)
  const manifest = {};
  for (const id of ids) {
    for (const ext of [".svg", ".png", ".webp"]) {
      if (existsSync(resolve(CACHE_DIR, `${id}${ext}`))) {
        manifest[id] = ext;
        break;
      }
    }
  }
  const manifestPath = resolve(CACHE_DIR, "manifest.json");
  const manifestTsPath = resolve(ROOT, "src/lib/data/national-team-crest-manifest.json");
  const manifestJson = JSON.stringify(manifest, null, 2) + "\n";
  writeFileSync(manifestPath, manifestJson, "utf8");
  writeFileSync(manifestTsPath, manifestJson, "utf8");

  console.log(`\nListo: ${ok} descargados, ${fail} fallos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
