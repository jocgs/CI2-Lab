/**
 * Base de datos local basada en archivos JSON.
 * Cada colección es un fichero en /data/*.json.
 * Solo se usa en servidor (Node.js) — nunca importar desde código cliente.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, data: T[]): void {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// API genérica
// ---------------------------------------------------------------------------

export function getAll<T>(collection: string): T[] {
  return readCollection<T>(collection);
}

export function getById<T extends { id: string }>(
  collection: string,
  id: string
): T | undefined {
  return readCollection<T>(collection).find((item) => item.id === id);
}

export function insert<T extends { id: string }>(collection: string, item: T): T {
  const items = readCollection<T>(collection);
  items.push(item);
  writeCollection(collection, items);
  return item;
}

export function update<T extends { id: string }>(
  collection: string,
  id: string,
  patch: Partial<T>
): T | undefined {
  const items = readCollection<T>(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...patch };
  writeCollection(collection, items);
  return items[idx];
}

export function remove(collection: string, id: string): boolean {
  const items = readCollection<{ id: string }>(collection);
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  writeCollection(collection, next);
  return true;
}

export function findWhere<T>(
  collection: string,
  predicate: (item: T) => boolean
): T[] {
  return readCollection<T>(collection).filter(predicate);
}

export function findOneWhere<T>(
  collection: string,
  predicate: (item: T) => boolean
): T | undefined {
  return readCollection<T>(collection).find(predicate);
}
