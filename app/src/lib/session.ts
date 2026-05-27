import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";
import { MOCK_USERS, CURRENT_USER_ID } from "./mocks/users";
import { USE_MOCKS } from "./runtime";
import type { User } from "@/types/domain";

export const SESSION_COOKIE = "porrify-session";

/**
 * Lee la cookie de sesión y devuelve el usuario.
 * En modo mock devuelve directamente el usuario hardcoded.
 */
export async function getSessionUser(): Promise<User | null> {
  if (USE_MOCKS) {
    return MOCK_USERS.find((u) => u.id === CURRENT_USER_ID) ?? null;
  }

  try {
    const cookieStore = await cookies();
    const uid = cookieStore.get(SESSION_COOKIE)?.value;
    if (!uid) return null;

    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() } as User;
  } catch {
    return null;
  }
}

/**
 * Solo el UID — más ligero que getSessionUser() cuando solo se
 * necesita el ID para escribir en Firestore.
 */
export async function getSessionUserId(): Promise<string | null> {
  if (USE_MOCKS) {
    return CURRENT_USER_ID;
  }
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Verifica el idToken de Firebase y crea/actualiza el doc de usuario.
 * Devuelve el UID o lanza si el token no es válido.
 */
export async function createSession(idToken: string): Promise<string> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  const userRef = adminDb.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    const shortId = uid.slice(-4).toUpperCase();
    await userRef.set({
      username: decoded.email?.split("@")[0] ?? `invitado_${shortId}`,
      displayName: decoded.name ?? decoded.email ?? `Invitado ${shortId}`,
      avatarUrl: decoded.picture ?? null,
      friendIds: [],
      supportedNationalTeamId: null,
      supportedTeamIds: [],
      createdAt: new Date().toISOString(),
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });

  return uid;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
