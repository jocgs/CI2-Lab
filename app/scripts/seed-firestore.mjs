/**
 * Seed Firestore con los datos existentes en data/*.json y los mocks estáticos.
 *
 * Uso:
 *   node scripts/seed-firestore.mjs
 *
 * Requiere las variables de entorno FIREBASE_* (lee .env.local automáticamente).
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");

// ── Cargar .env.local manualmente ────────────────────────────────────────────
const envPath = resolve(ROOT, ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Eliminar comillas externas
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
  console.log("✅ .env.local cargado");
}

// ── Inicializar Firebase Admin ────────────────────────────────────────────────
const require = createRequire(import.meta.url);
const admin   = require("firebase-admin");

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(file) {
  const p = resolve(ROOT, "data", file);
  if (!existsSync(p)) { console.warn(`⚠️  ${file} no encontrado, omitiendo.`); return []; }
  return JSON.parse(readFileSync(p, "utf-8"));
}

async function seedCollection(collectionName, items, { idField = "id", upsert = true } = {}) {
  if (!items.length) { console.log(`   ${collectionName}: vacío, omitido.`); return; }

  const BATCH = 400;
  let written = 0;

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = db.batch();
    for (const item of items.slice(i, i + BATCH)) {
      const { [idField]: id, ...data } = item;
      // Limpiar undefined
      const clean = JSON.parse(JSON.stringify(data));
      const ref = db.collection(collectionName).doc(id);
      if (upsert) batch.set(ref, clean, { merge: true });
      else        batch.set(ref, clean);
    }
    await batch.commit();
    written += items.slice(i, i + BATCH).length;
  }

  console.log(`   ✓ ${collectionName}: ${written} documentos`);
}

// ── Datos de data/*.json ──────────────────────────────────────────────────────

async function seedFromJsonFiles() {
  console.log("\n📂 Subiendo datos de data/*.json...");
  await seedCollection("users",        readJson("users.json"));
  await seedCollection("teams",        readJson("teams.json"));
  await seedCollection("competitions", readJson("competitions.json"));
  await seedCollection("matches",      readJson("matches.json"));
  await seedCollection("bets",         readJson("bets.json"));
  await seedCollection("groups",       readJson("groups.json"));
}

// ── Datos estáticos de mocks (jugadores y selecciones fantasy) ────────────────

async function seedFantasyStaticData() {
  console.log("\n⚽ Subiendo jugadores y selecciones fantasy...");

  // Importamos los mocks transpilados desde la carpeta .next/server si existe,
  // o los leemos directamente del código fuente como JSON si no hay build.
  // En el momento del seed normalmente tenemos el source; lo parseamos a mano.

  const playersPath = resolve(ROOT, "src/lib/mocks/fantasy-players.ts");
  const teamsPath   = resolve(ROOT, "src/lib/mocks/fantasy-national-teams.ts");

  if (!existsSync(playersPath) || !existsSync(teamsPath)) {
    console.warn("⚠️  No se encontraron los ficheros de mocks. Omitiendo fantasy static data.");
    return;
  }

  // Usamos tsx / ts-node si está disponible; si no, avisamos
  console.log("   ℹ️  Los jugadores y selecciones se cargan dinámicamente desde el mock en runtime.");
  console.log("   ℹ️  Para subirlos a Firestore ejecuta: npx tsx scripts/seed-fantasy-static.ts");
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("🚀 Iniciando seed de Firestore...");
console.log(`   Proyecto: ${process.env.FIREBASE_PROJECT_ID}`);

try {
  await seedFromJsonFiles();
  await seedFantasyStaticData();
  console.log("\n✅ Seed completado. ¡Firestore listo!");
} catch (err) {
  console.error("\n❌ Error durante el seed:", err);
  process.exit(1);
}
