import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length && projectId && clientEmail && privateKey) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unusable(label: string): any {
  return new Proxy({} as object, {
    get() {
      throw new Error(
        `${label} no disponible — configura las variables FIREBASE_* en .env.local`,
      );
    },
  });
}

const ready = getApps().length > 0;

export const adminDb   = ready ? getFirestore() : unusable("adminDb");
export const adminAuth = ready ? getAuth()       : unusable("adminAuth");
