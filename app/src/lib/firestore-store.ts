/**
 * Capa de acceso a Firestore.
 * Misma interfaz conceptual que local-store.ts pero async y usando Firebase Admin SDK.
 * Solo se usa en servidor (Node.js / Next.js Server Components / Server Actions).
 */

import { adminDb } from "./firebase-admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snapToObj<T>(doc: any): T {
  return { id: doc.id, ...(doc.data() ?? {}) } as T;
}

// ── CRUD básico ───────────────────────────────────────────────────────────────

export async function getAll<T>(collection: string): Promise<T[]> {
  const snap = await adminDb.collection(collection).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => snapToObj<T>(d));
}

export async function getById<T>(collection: string, id: string): Promise<T | undefined> {
  const doc = await adminDb.collection(collection).doc(id).get();
  if (!doc.exists) return undefined;
  return snapToObj<T>(doc);
}

export async function insert<T extends { id: string }>(collection: string, item: T): Promise<T> {
  const { id, ...data } = item;
  // Firestore no acepta `undefined`; limpiamos antes de guardar
  await adminDb.collection(collection).doc(id).set(cleanUndefined(data));
  return item;
}

export async function upsert<T extends { id: string }>(collection: string, item: T): Promise<T> {
  const { id, ...data } = item;
  await adminDb.collection(collection).doc(id).set(cleanUndefined(data), { merge: true });
  return item;
}

export async function patch(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await adminDb.collection(collection).doc(id).update(cleanUndefined(data));
}

export async function remove(collection: string, id: string): Promise<void> {
  await adminDb.collection(collection).doc(id).delete();
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** WHERE field == value  */
export async function queryWhere<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  const snap = await adminDb.collection(collection).where(field, "==", value).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => snapToObj<T>(d));
}

/** WHERE field == value  LIMIT 1 */
export async function queryWhereOne<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T | undefined> {
  const snap = await adminDb
    .collection(collection)
    .where(field, "==", value)
    .limit(1)
    .get();
  if (snap.empty) return undefined;
  return snapToObj<T>(snap.docs[0]);
}

/** WHERE field IN values */
export async function queryWhereIn<T>(
  collection: string,
  field: string,
  values: unknown[],
): Promise<T[]> {
  if (values.length === 0) return [];
  const snap = await adminDb.collection(collection).where(field, "in", values).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => snapToObj<T>(d));
}

/** WHERE field array-contains value */
export async function queryWhereArrayContains<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  const snap = await adminDb
    .collection(collection)
    .where(field, "array-contains", value)
    .get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => snapToObj<T>(d));
}

/** WHERE field1 == v1 AND field2 == v2  LIMIT 1 */
export async function queryWhereCompoundOne<T>(
  collection: string,
  conditions: Array<[string, unknown]>,
): Promise<T | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = adminDb.collection(collection);
  for (const [field, value] of conditions) {
    q = q.where(field, "==", value);
  }
  const snap = await q.limit(1).get();
  if (snap.empty) return undefined;
  return snapToObj<T>(snap.docs[0]);
}

// ── Helpers internos ──────────────────────────────────────────────────────────

/** Elimina campos con valor `undefined` (Firestore los rechaza). */
function cleanUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}
