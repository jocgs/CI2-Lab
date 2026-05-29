/**
 * Sube jugadores y selecciones nacionales fantasy a Firestore.
 *
 * Uso:
 *   npx tsx scripts/seed-fantasy-static.ts
 *
 * Requiere las variables FIREBASE_* en .env.local.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { FANTASY_PLAYERS } from "../src/lib/mocks/fantasy-players-data";
import { buildNationalTeamsFromPlayers } from "../src/lib/mocks/fantasy-national-teams-data";

const FANTASY_NATIONAL_TEAMS = buildNationalTeamsFromPlayers(FANTASY_PLAYERS);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function seedCollection<T extends { id: string }>(name: string, items: T[]) {
  const BATCH_SIZE = 400;
  let written = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const { id, ...data } of items.slice(i, i + BATCH_SIZE)) {
      batch.set(db.collection(name).doc(id), data);
    }
    await batch.commit();
    written += items.slice(i, i + BATCH_SIZE).length;
  }

  console.log(`✓ ${name}: ${written} documentos`);
}

async function main() {
  console.log("🚀 Subiendo datos estáticos de fantasy...\n");
  console.log(`   Proyecto: ${process.env.FIREBASE_PROJECT_ID}`);

  await seedCollection("fantasy_players", FANTASY_PLAYERS);
  await seedCollection("fantasy_national_teams", FANTASY_NATIONAL_TEAMS);

  console.log("\n✅ Fantasy static data completado.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Error:", err);
  process.exit(1);
});
