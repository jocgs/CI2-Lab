import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { USE_MOCKS } from "./runtime";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const hasClientConfig = Object.values(firebaseConfig).every(Boolean);

const app =
  !USE_MOCKS && hasClientConfig
    ? getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp()
    : null;

export const auth = app ? getAuth(app) : ({} as ReturnType<typeof getAuth>);
export default app;
