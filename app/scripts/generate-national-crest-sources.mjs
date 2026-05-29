/**
 * Genera national-team-crest-sources.json (Paladar Negro PNG por defecto).
 * Ejecutar: node scripts/generate-national-crest-sources.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PLAYERS_PATH = resolve(ROOT, "src/lib/data/jugadores.json");
const OUT_PATH = resolve(ROOT, "src/lib/data/national-team-crest-sources.json");

const PN_BASE = "https://paladarnegro.net/escudoteca/selecciones/selecciones/png";

/** nationalTeamId → slug en paladarnegro.net */
const PALADARNEGRO_SLUG = {
  algeria: "argelia",
  argentina: "argentina",
  australia: "australia",
  austria: "austria",
  belgium: "belgica",
  bosnia: "bosnia",
  brazil: "brasil",
  canada: "canada",
  cape_verde: "cabo_verde",
  colombia: "colombia",
  croatia: "croacia",
  curacao: "curazao",
  czech_republic: "republicacheca",
  dr_congo: "congo",
  ecuador: "ecuador",
  egypt: "egipto",
  england: "inglaterra",
  france: "francia",
  germany: "alemania",
  ghana: "ghana",
  haiti: "haiti",
  iran: "iran",
  iraq: "irak",
  ivory_coast: "costa_de_marfil",
  japan: "japon",
  jordan: "jordania",
  mexico: "mexico",
  morocco: "marruecos",
  netherlands: "paisesbajos",
  new_zealand: "nuevazelanda",
  norway: "noruega",
  panama: "panama",
  paraguay: "paraguay",
  portugal: "portugal",
  qatar: "qatar",
  saudi_arabia: "arabiasaudita",
  scotland: "escocia",
  senegal: "senegal",
  south_africa: "sudafrica",
  south_korea: "coreadelsur",
  spain: "espana",
  sweden: "suecia",
  switzerland: "suiza",
  tunisia: "tunez",
  turkey: "turquia",
  uruguay: "uruguay",
  usa: "usa",
  uzbekistan: "uzbekistan",
};

function main() {
  const players = JSON.parse(readFileSync(PLAYERS_PATH, "utf8")).fantasyPlayers;
  const ids = [...new Set(players.map((p) => p.nationalTeamId))].sort();
  const sources = {};

  for (const id of ids) {
    const slug = PALADARNEGRO_SLUG[id];
    if (!slug) {
      console.warn(`Sin slug Paladar Negro: ${id}`);
      continue;
    }
    sources[id] = {
      name: id,
      sourceUrl: `${PN_BASE}/${slug}.png`,
    };
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(sources, null, 2) + "\n", "utf8");
  console.log(`Escrito ${OUT_PATH} (${Object.keys(sources).length} selecciones)`);
}

main();
