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

// 1. Migrar match_4 y match_8 de comp_ucl → fd_comp_CL
const batch1 = db.batch();
batch1.update(db.collection("matches").doc("match_4"), { competitionId: "fd_comp_CL" });
batch1.update(db.collection("matches").doc("match_8"), { competitionId: "fd_comp_CL" });
await batch1.commit();
console.log("✓ match_4 y match_8 migrados a fd_comp_CL");

// 2. Eliminar competiciones duplicadas/huérfanas
const batch2 = db.batch();
batch2.delete(db.collection("competitions").doc("comp_ucl"));
batch2.delete(db.collection("competitions").doc("comp_mundial"));
await batch2.commit();
console.log("✓ Eliminadas competiciones duplicadas: comp_ucl, comp_mundial");

console.log("\n  Competiciones que quedan:");
console.log("  · comp_laliga  → LaLiga (match_1..3, 5..7)");
console.log("  · fd_comp_CL   → Champions League (match_4, match_8, UCL Final real)");
console.log("  · fd_comp_WC   → Mundial 2026 (72 partidos reales)");
process.exit(0);
