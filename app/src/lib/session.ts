import { cookies } from "next/headers";
import * as fs from "./data-store";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@/types/domain";

export const SESSION_COOKIE = "tikitaka-session";

// ---------------------------------------------------------------------------
// HMAC cookie signing — evita que un atacante forge un userId arbitrario
// ---------------------------------------------------------------------------

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET no está configurado en producción");
  }
  return s ?? "dev-secret-insecure-change-me";
}

function signUserId(userId: string): string {
  const sig = createHmac("sha256", getSecret()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verifySignedCookie(value: string): string | null {
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const userId = value.slice(0, lastDot);
  const givenSig = value.slice(lastDot + 1);
  const expectedSig = createHmac("sha256", getSecret()).update(userId).digest("hex");
  const a = Buffer.from(givenSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? userId : null;
}

type UserWithPassword = User & { email?: string; passwordHash?: string };

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;

    const uid = verifySignedCookie(raw);
    if (!uid) return null;

    const user = await fs.getById<UserWithPassword>("users", uid);
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pw, ...safeUser } = user;
    return safeUser as User;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  if (!raw) return null;
  return verifySignedCookie(raw);
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function createSession(email: string, password: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await fs.queryWhereOne<UserWithPassword>("users", "email", normalizedEmail);
  if (!user) throw new Error("Correo o contraseña incorrectos");

  const passwordHash = user.passwordHash ?? "";
  const valid = passwordHash ? await bcrypt.compare(password, passwordHash) : false;
  if (!valid) throw new Error("Correo o contraseña incorrectos");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signUserId(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return user.id;
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

export async function registerUser(input: {
  email: string;
  displayName: string;
  password: string;
}): Promise<string> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await fs.queryWhereOne<UserWithPassword>("users", "email", normalizedEmail);
  if (existing) throw new Error("Ese correo ya está registrado");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const uid = `user_${Math.random().toString(36).slice(2, 10)}`;
  // Los usernames se guardan en minúsculas para poder buscarlos sin case-sensitivity
  const username = normalizedEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_");

  const newUser: UserWithPassword = {
    id: uid,
    username,
    displayName: input.displayName.trim(),
    email: normalizedEmail,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(input.displayName.trim())}&background=6366f1&color=fff&bold=true`,
    passwordHash,
    friendIds: [],
    friendRequestSentIds: [],
    friendRequestReceivedIds: [],
    supportedTeamIds: [],
    createdAt: new Date().toISOString(),
  };

  await fs.insert("users", newUser);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signUserId(uid), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return uid;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
