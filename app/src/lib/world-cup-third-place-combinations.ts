import combinations from "@/lib/data/world-cup-third-place-combinations.json";

type SlotMap = Record<string, string>;

const LOOKUP = combinations as Record<string, SlotMap>;

/** Mapa FIFA: 8 grupos clasificados (ordenados) → grupo asignado a cada hueco de 3º. */
export function lookupThirdPlaceSlots(qualifyingGroups: string[]): SlotMap | null {
  if (qualifyingGroups.length !== 8) return null;
  const key = [...qualifyingGroups].sort().join("");
  return LOOKUP[key] ?? null;
}
