/**
 * Script de demo: da monedas a un usuario en Firestore (o en local JSON).
 * Uso: node scripts/give-coins.mjs <username> <cantidad>
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const username = process.argv[2];
const amount   = Number(process.argv[3]);

if (!username || isNaN(amount)) {
  console.error("Uso: node scripts/give-coins.mjs <username> <cantidad>");
  process.exit(1);
}

const { projectId, clientEmail } = {
  projectId:   process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// ── Modo Firestore ──────────────────────────────────────────────────────────
if (projectId && clientEmail && process.env.FIREBASE_PRIVATE_KEY) {
  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore }                 = await import("firebase-admin/firestore");

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();
  const snap = await db.collection("users").where("username", "==", username).get();

  if (snap.empty) {
    console.error(`Usuario "${username}" no encontrado en Firestore.`);
    process.exit(1);
  }

  const doc  = snap.docs[0];
  const prev = doc.data().coins ?? 0;
  await doc.ref.update({ coins: amount });
  console.log(`✓ Firestore: ${username} · monedas ${prev} → ${amount}`);
  process.exit(0);
}

// ── Modo local JSON ─────────────────────────────────────────────────────────
const dataPath = resolve(__dirname, "../data/users.json");
if (!existsSync(dataPath)) {
  console.error("No se encontró data/users.json y no hay credenciales de Firebase.");
  process.exit(1);
}

const users = JSON.parse(readFileSync(dataPath, "utf-8"));
const idx   = users.findIndex((u) => u.username === username);

if (idx === -1) {
  console.error(`Usuario "${username}" no encontrado en users.json.`);
  process.exit(1);
}

const prev = users[idx].coins ?? 0;
users[idx].coins = amount;
writeFileSync(dataPath, JSON.stringify(users, null, 2) + "\n", "utf-8");
console.log(`✓ Local JSON: ${username} · monedas ${prev} → ${amount}`);
