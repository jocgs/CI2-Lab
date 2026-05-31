/**
 * Seed de la base de datos LOCAL (archivos JSON en /data) con partidos REALES
 * descargados de football-data.org.
 *
 * Uso:
 *   npm run seed:local
 *
 * Requiere FOOTBALL_DATA_API_KEY en .env.local.
 * Reescribe únicamente competitions.json, teams.json y matches.json.
 * No toca users.json, groups.json ni bets.json.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { writeFileSync } from "fs";
import { fetchRecentAndUpcomingMatches } from "../src/lib/football-api";

const DATA_DIR = resolve(__dirname, "../data");

function writeCollection(name: string, items: unknown[]) {
  const fp = resolve(DATA_DIR, `${name}.json`);
  writeFileSync(fp, JSON.stringify(items, null, 2) + "\n", "utf-8");
  console.log(`✓ ${name}.json: ${items.length} registros`);
}

async function main() {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    throw new Error(
      "Falta FOOTBALL_DATA_API_KEY en .env.local. Regístrate gratis en https://www.football-data.org/",
    );
  }

  console.log("Descargando partidos del Mundial 2026 desde football-data.org...\n");

  const { competitions, teams, matches } = await fetchRecentAndUpcomingMatches();

  if (matches.length === 0) {
    console.warn("⚠ No se han recibido partidos del Mundial.");
  }

  writeCollection("competitions", competitions);
  writeCollection("teams", teams);
  writeCollection("matches", matches);

  console.log("\n✅ Datos reales sembrados en /data. Reinicia el servidor para verlos.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error en el seed local:", err);
  process.exit(1);
});
