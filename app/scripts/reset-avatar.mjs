import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const username = process.argv[2];
if (!username) { console.error("Uso: node scripts/reset-avatar.mjs <username>"); process.exit(1); }

const { initializeApp, cert, getApps } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");

if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  })});
}

const db = getFirestore();
const snap = await db.collection("users").where("username", "==", username).get();
if (snap.empty) { console.error(`"${username}" no encontrado`); process.exit(1); }

await snap.docs[0].ref.update({ activeAvatarId: null, unlockedAvatarIds: [] });
console.log(`✓ ${username}: activeAvatarId=null, unlockedAvatarIds=[]`);
process.exit(0);
