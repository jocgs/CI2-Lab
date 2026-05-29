/**
 * Normaliza jugadores.json (p. ej. pegado desde un chat) y escribe
 * app/src/lib/data/jugadores.json listo para la app.
 *
 * Uso desde app/: node scripts/normalize-jugadores.mjs [ruta-al-json]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultInput = resolve(__dirname, "../../jugadores.json");
const outputPath = resolve(__dirname, "../src/lib/data/jugadores.json");

const inputPath = process.argv[2] ? resolve(process.argv[2]) : defaultInput;
const raw = readFileSync(inputPath, "utf8");

const players = [];
const re =
  /\{\s*"id":\s*"([^"]+)"[\s\S]*?"totalFantasyPoints":\s*\d+\s*\}/g;
let m;
while ((m = re.exec(raw)) !== null) {
  try {
    const obj = JSON.parse(m[0]);
    if (obj.id && obj.position && obj.nationalTeamId) players.push(obj);
  } catch {
    /* skip malformed fragment */
  }
}

const byId = new Map();
for (const p of players) byId.set(p.id, p);
const unique = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));

if (unique.length === 0) {
  console.error("No se extrajo ningún jugador. Revisa el JSON de entrada.");
  process.exit(1);
}

const payload = { fantasyPlayers: unique };
writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`✓ ${unique.length} jugadores → ${outputPath}`);
console.log(`  Selecciones: ${new Set(unique.map((p) => p.nationalTeamId)).size}`);
