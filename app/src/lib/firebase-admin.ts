import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { USE_MOCKS } from "./runtime";

const hasAdminConfig = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

if (!USE_MOCKS && hasAdminConfig && !getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // Vercel encode las newlines como \\n en las env vars
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

function createMissingFirebaseAdminProxy<T extends object>(label: string): T {
  return new Proxy({} as T, {
    get() {
      throw new Error(`${label} no está configurado`);
    },
  });
}

export const adminDb =
  USE_MOCKS || !hasAdminConfig
    ? createMissingFirebaseAdminProxy<ReturnType<typeof getFirestore>>("Firebase Admin")
    : getFirestore();
export const adminAuth =
  USE_MOCKS || !hasAdminConfig
    ? createMissingFirebaseAdminProxy<ReturnType<typeof getAuth>>("Firebase Admin")
    : getAuth();
