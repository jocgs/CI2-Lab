import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const envPath = resolve(ROOT, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[t.slice(0, i).trim()] = val;
  }
}

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
}
const db = admin.firestore();

async function deleteCollection(collectionName, filter) {
  let snap;
  if (filter) {
    snap = await filter(db.collection(collectionName)).get();
  } else {
    snap = await db.collection(collectionName).get();
  }
  if (snap.empty) { console.log(`  · ${collectionName}: ya vacío`); return 0; }
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.docs.slice(i, i + 400).length;
  }
  return deleted;
}

// 1. Borrar partidos inventados (match_1 a match_8)
const fakeIds = ["match_1","match_2","match_3","match_4","match_5","match_6","match_7","match_8"];
const batch = db.batch();
fakeIds.forEach(id => batch.delete(db.collection("matches").doc(id)));
await batch.commit();
console.log(`✓ Eliminados ${fakeIds.length} partidos inventados (match_1..8)`);

// 2. Borrar todas las porras (reset estadísticas)
const betsDeleted = await deleteCollection("bets");
console.log(`✓ Eliminadas ${betsDeleted} porras — todos los jugadores a 0 puntos`);

console.log("\n  Estado final:");
console.log("  · Solo quedan partidos reales del API (fd_match_*)");
console.log("  · Nadie tiene puntos — ranking limpio para la demo");
process.exit(0);
