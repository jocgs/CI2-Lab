import type { Formation } from "@/types/fantasy";

export interface FormationRequirements {
  defenders: number;
  midfielders: number;
  forwards: number;
}

export const FORMATION_OPTIONS: Array<{
  value: Formation;
  label: string;
  description: string;
  defenders: number;
  midfielders: number;
  forwards: number;
}> = [
  { value: "3-5-2", label: "3-5-2", description: "3 defensas, 5 medios, 2 delanteros", defenders: 3, midfielders: 5, forwards: 2 },
  { value: "3-4-3", label: "3-4-3", description: "3 defensas, 4 medios, 3 delanteros", defenders: 3, midfielders: 4, forwards: 3 },
  { value: "4-3-3", label: "4-3-3", description: "4 defensas, 3 medios, 3 delanteros", defenders: 4, midfielders: 3, forwards: 3 },
  { value: "4-4-2", label: "4-4-2", description: "4 defensas, 4 medios, 2 delanteros", defenders: 4, midfielders: 4, forwards: 2 },
  { value: "5-3-2", label: "5-3-2", description: "5 defensas, 3 medios, 2 delanteros", defenders: 5, midfielders: 3, forwards: 2 },
  { value: "5-2-3", label: "5-2-3", description: "5 defensas, 2 medios, 3 delanteros", defenders: 5, midfielders: 2, forwards: 3 },
];

const FORMATION_REQUIREMENTS: Record<Formation, FormationRequirements> = {
  "3-5-2": { defenders: 3, midfielders: 5, forwards: 2 },
  "3-4-3": { defenders: 3, midfielders: 4, forwards: 3 },
  "4-3-3": { defenders: 4, midfielders: 3, forwards: 3 },
  "4-4-2": { defenders: 4, midfielders: 4, forwards: 2 },
  "5-3-2": { defenders: 5, midfielders: 3, forwards: 2 },
  "5-2-3": { defenders: 5, midfielders: 2, forwards: 3 },
};

export function getFormationRequirements(formation: Formation): FormationRequirements {
  return FORMATION_REQUIREMENTS[formation];
}

export function getFormationLabel(formation: Formation): string {
  return formation;
}
