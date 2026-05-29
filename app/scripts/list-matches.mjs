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

const [matches, teams, comps] = await Promise.all([
  db.collection("matches").get(),
  db.collection("teams").get(),
  db.collection("competitions").get(),
]);

console.log(`\n=== MATCHES (${matches.size}) ===`);
matches.docs.map(d => d.id).sort().forEach(id => console.log(" ", id));

console.log(`\n=== TEAMS (${teams.size}) ===`);
teams.docs.map(d => d.id).sort().forEach(id => console.log(" ", id));

console.log(`\n=== COMPETITIONS (${comps.size}) ===`);
comps.docs.map(d => d.id).sort().forEach(id => console.log(" ", id));

process.exit(0);
