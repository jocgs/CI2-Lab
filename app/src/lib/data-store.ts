/**
 * Capa de datos unificada: Firestore si hay FIREBASE_* en .env.local,
 * si no, JSON local en /data (desarrollo sin Firebase).
 */

import "./firebase-admin";
import { getApps } from "firebase-admin/app";
import * as local from "./local-store";
import * as firestore from "./firestore-store";

export const usesLocalStore = getApps().length === 0;

export async function getAll<T>(collection: string): Promise<T[]> {
  if (usesLocalStore) return local.getAll<T>(collection);
  return firestore.getAll<T>(collection);
}

export async function getById<T>(collection: string, id: string): Promise<T | undefined> {
  if (usesLocalStore) return local.getById<{ id: string }>(collection, id) as T | undefined;
  return firestore.getById<T>(collection, id);
}

export async function insert<T extends { id: string }>(collection: string, item: T): Promise<T> {
  if (usesLocalStore) return local.insert(collection, item);
  return firestore.insert(collection, item);
}

export async function upsert<T extends { id: string }>(collection: string, item: T): Promise<T> {
  if (usesLocalStore) {
    const existing = local.getById<T>(collection, item.id);
    if (existing) {
      local.update(collection, item.id, item);
      return item;
    }
    return local.insert(collection, item);
  }
  return firestore.upsert(collection, item);
}

export async function patch(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (usesLocalStore) {
    local.update(collection, id, data);
    return;
  }
  return firestore.patch(collection, id, data);
}

export async function remove(collection: string, id: string): Promise<void> {
  if (usesLocalStore) {
    local.remove(collection, id);
    return;
  }
  return firestore.remove(collection, id);
}

export async function queryWhere<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  if (usesLocalStore) {
    return local.findWhere<T>(
      collection,
      (item) => (item as Record<string, unknown>)[field] === value,
    );
  }
  return firestore.queryWhere<T>(collection, field, value);
}

export async function queryWhereOne<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T | undefined> {
  if (usesLocalStore) {
    return local.findOneWhere<T>(
      collection,
      (item) => (item as Record<string, unknown>)[field] === value,
    );
  }
  return firestore.queryWhereOne<T>(collection, field, value);
}

export async function queryWhereIn<T>(
  collection: string,
  field: string,
  values: unknown[],
): Promise<T[]> {
  if (values.length === 0) return [];
  if (usesLocalStore) {
    const set = new Set(values);
    return local.findWhere<T>(
      collection,
      (item) => set.has((item as Record<string, unknown>)[field]),
    );
  }
  return firestore.queryWhereIn<T>(collection, field, values);
}

export async function queryWhereArrayContains<T>(
  collection: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  if (usesLocalStore) {
    return local.findWhere<T>(collection, (item) => {
      const arr = (item as Record<string, unknown>)[field];
      return Array.isArray(arr) && arr.includes(value);
    });
  }
  return firestore.queryWhereArrayContains<T>(collection, field, value);
}

export async function queryWhereCompoundOne<T>(
  collection: string,
  conditions: Array<[string, unknown]>,
): Promise<T | undefined> {
  if (usesLocalStore) {
    return local.findOneWhere<T>(collection, (item) =>
      conditions.every(([field, value]) => (item as Record<string, unknown>)[field] === value),
    );
  }
  return firestore.queryWhereCompoundOne<T>(collection, conditions);
}
