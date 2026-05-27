/**
 * Seed de Firestore con los datos mock del martes.
 *
 * Uso:
 *   npx tsx scripts/seed.ts
 *
 * Requiere que exista .env.local con las variables de Firebase Admin.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// Datos (idénticos a los mocks del martes)
// ---------------------------------------------------------------------------

const competitions = [
  { id: "comp_laliga", name: "LaLiga EA Sports", shortName: "LaLiga", season: "2025/26" },
  { id: "comp_ucl", name: "UEFA Champions League", shortName: "UCL", season: "2025/26" },
];

const teams = [
  { id: "team_rma", name: "Real Madrid", shortName: "RMA", country: "España" },
  { id: "team_fcb", name: "FC Barcelona", shortName: "FCB", country: "España" },
  { id: "team_atm", name: "Atlético de Madrid", shortName: "ATM", country: "España" },
  { id: "team_seve", name: "Sevilla FC", shortName: "SEV", country: "España" },
  { id: "team_bet", name: "Real Betis", shortName: "BET", country: "España" },
  { id: "team_val", name: "Valencia CF", shortName: "VAL", country: "España" },
  { id: "team_vil", name: "Villarreal CF", shortName: "VIL", country: "España" },
  { id: "team_ath", name: "Athletic Club", shortName: "ATH", country: "España" },
  { id: "team_rso", name: "Real Sociedad", shortName: "RSO", country: "España" },
  { id: "team_gir", name: "Girona FC", shortName: "GIR", country: "España" },
  { id: "team_mci", name: "Manchester City", shortName: "MCI", country: "Inglaterra" },
  { id: "team_bay", name: "Bayern München", shortName: "BAY", country: "Alemania" },
  { id: "team_psg", name: "Paris Saint-Germain", shortName: "PSG", country: "Francia" },
  { id: "team_int", name: "Inter de Milán", shortName: "INT", country: "Italia" },
];

const matches = [
  {
    id: "match_1",
    competitionId: "comp_laliga",
    homeTeamId: "team_rma",
    awayTeamId: "team_fcb",
    kickoffAt: "2026-05-18T20:00:00.000Z",
    status: "FINISHED",
    result: { homeGoals: 2, awayGoals: 1, outcome: "1" },
  },
  {
    id: "match_2",
    competitionId: "comp_laliga",
    homeTeamId: "team_atm",
    awayTeamId: "team_seve",
    kickoffAt: "2026-05-19T18:30:00.000Z",
    status: "FINISHED",
    result: { homeGoals: 3, awayGoals: 0, outcome: "1" },
  },
  {
    id: "match_3",
    competitionId: "comp_laliga",
    homeTeamId: "team_bet",
    awayTeamId: "team_val",
    kickoffAt: "2026-05-20T19:00:00.000Z",
    status: "FINISHED",
    result: { homeGoals: 1, awayGoals: 1, outcome: "X" },
  },
  {
    id: "match_4",
    competitionId: "comp_ucl",
    homeTeamId: "team_mci",
    awayTeamId: "team_bay",
    kickoffAt: "2026-05-22T19:00:00.000Z",
    status: "FINISHED",
    result: { homeGoals: 1, awayGoals: 2, outcome: "2" },
  },
  {
    id: "match_5",
    competitionId: "comp_laliga",
    homeTeamId: "team_vil",
    awayTeamId: "team_ath",
    kickoffAt: "2026-05-24T16:00:00.000Z",
    status: "FINISHED",
    result: { homeGoals: 0, awayGoals: 2, outcome: "2" },
  },
  {
    id: "match_6",
    competitionId: "comp_laliga",
    homeTeamId: "team_rso",
    awayTeamId: "team_gir",
    kickoffAt: "2026-05-26T07:30:00.000Z",
    status: "LIVE",
  },
  {
    id: "match_7",
    competitionId: "comp_laliga",
    homeTeamId: "team_fcb",
    awayTeamId: "team_atm",
    kickoffAt: "2026-05-27T20:00:00.000Z",
    status: "SCHEDULED",
  },
  {
    id: "match_8",
    competitionId: "comp_ucl",
    homeTeamId: "team_psg",
    awayTeamId: "team_int",
    kickoffAt: "2026-05-28T19:00:00.000Z",
    status: "SCHEDULED",
  },
  {
    id: "match_9",
    competitionId: "comp_laliga",
    homeTeamId: "team_rma",
    awayTeamId: "team_seve",
    kickoffAt: "2026-05-29T19:30:00.000Z",
    status: "SCHEDULED",
  },
  {
    id: "match_10",
    competitionId: "comp_laliga",
    homeTeamId: "team_bet",
    awayTeamId: "team_vil",
    kickoffAt: "2026-05-30T17:00:00.000Z",
    status: "SCHEDULED",
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seedCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  const batch = db.batch();
  for (const { id, ...data } of items) {
    batch.set(db.collection(collectionName).doc(id), data);
  }
  await batch.commit();
  console.log(`✓ ${collectionName}: ${items.length} documentos`);
}

async function main() {
  console.log("Iniciando seed de Firestore...\n");

  await seedCollection("competitions", competitions);
  await seedCollection("teams", teams);
  await seedCollection("matches", matches);

  console.log("\n✅ Seed completado. Ya puedes arrancar la app.");
  console.log("   Las porras y grupos se crearán cuando los usuarios se registren.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
