import type {
  BracketMatchSlot,
  BracketRound,
  BracketTeamInfo,
  GroupStandings,
  KnockoutWinners,
  ResolvedBracketMatch,
} from "@/types/bracket-prediction";
import { getWorldCupTeamById, WORLD_CUP_GROUP_LETTERS } from "@/lib/world-cup-groups";
import { lookupThirdPlaceSlots } from "@/lib/world-cup-third-place-combinations";

/** Plantilla oficial del cuadro FIFA 2026 (partidos 73–104). */
export const BRACKET_MATCH_SLOTS: BracketMatchSlot[] = [
  { id: "m73", round: "round_of_32", label: "2A vs 2B", homeSource: { type: "group", group: "A", position: 2 }, awaySource: { type: "group", group: "B", position: 2 } },
  { id: "m74", round: "round_of_32", label: "1E vs 3º", homeSource: { type: "group", group: "E", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["A", "B", "C", "D", "F"] } },
  { id: "m75", round: "round_of_32", label: "1F vs 2C", homeSource: { type: "group", group: "F", position: 1 }, awaySource: { type: "group", group: "C", position: 2 } },
  { id: "m76", round: "round_of_32", label: "1C vs 2F", homeSource: { type: "group", group: "C", position: 1 }, awaySource: { type: "group", group: "F", position: 2 } },
  { id: "m77", round: "round_of_32", label: "1I vs 3º", homeSource: { type: "group", group: "I", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["C", "D", "F", "G", "H"] } },
  { id: "m78", round: "round_of_32", label: "2E vs 2I", homeSource: { type: "group", group: "E", position: 2 }, awaySource: { type: "group", group: "I", position: 2 } },
  { id: "m79", round: "round_of_32", label: "1A vs 3º", homeSource: { type: "group", group: "A", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["C", "E", "F", "H", "I"] } },
  { id: "m80", round: "round_of_32", label: "1L vs 3º", homeSource: { type: "group", group: "L", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["E", "H", "I", "J", "K"] } },
  { id: "m81", round: "round_of_32", label: "1D vs 3º", homeSource: { type: "group", group: "D", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["B", "E", "F", "I", "J"] } },
  { id: "m82", round: "round_of_32", label: "1G vs 3º", homeSource: { type: "group", group: "G", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["A", "E", "H", "I", "J"] } },
  { id: "m83", round: "round_of_32", label: "2K vs 2L", homeSource: { type: "group", group: "K", position: 2 }, awaySource: { type: "group", group: "L", position: 2 } },
  { id: "m84", round: "round_of_32", label: "1H vs 2J", homeSource: { type: "group", group: "H", position: 1 }, awaySource: { type: "group", group: "J", position: 2 } },
  { id: "m85", round: "round_of_32", label: "1B vs 3º", homeSource: { type: "group", group: "B", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["E", "F", "G", "I", "J"] } },
  { id: "m86", round: "round_of_32", label: "1J vs 2H", homeSource: { type: "group", group: "J", position: 1 }, awaySource: { type: "group", group: "H", position: 2 } },
  { id: "m87", round: "round_of_32", label: "1K vs 3º", homeSource: { type: "group", group: "K", position: 1 }, awaySource: { type: "third_eligible", eligibleGroups: ["D", "E", "I", "J", "L"] } },
  { id: "m88", round: "round_of_32", label: "2D vs 2G", homeSource: { type: "group", group: "D", position: 2 }, awaySource: { type: "group", group: "G", position: 2 } },
  { id: "m89", round: "round_of_16", label: "W73 vs W75", homeSource: { type: "winner", matchId: "m73" }, awaySource: { type: "winner", matchId: "m75" } },
  { id: "m90", round: "round_of_16", label: "W74 vs W77", homeSource: { type: "winner", matchId: "m74" }, awaySource: { type: "winner", matchId: "m77" } },
  { id: "m91", round: "round_of_16", label: "W76 vs W78", homeSource: { type: "winner", matchId: "m76" }, awaySource: { type: "winner", matchId: "m78" } },
  { id: "m92", round: "round_of_16", label: "W79 vs W80", homeSource: { type: "winner", matchId: "m79" }, awaySource: { type: "winner", matchId: "m80" } },
  { id: "m93", round: "round_of_16", label: "W83 vs W84", homeSource: { type: "winner", matchId: "m83" }, awaySource: { type: "winner", matchId: "m84" } },
  { id: "m94", round: "round_of_16", label: "W81 vs W82", homeSource: { type: "winner", matchId: "m81" }, awaySource: { type: "winner", matchId: "m82" } },
  { id: "m95", round: "round_of_16", label: "W86 vs W88", homeSource: { type: "winner", matchId: "m86" }, awaySource: { type: "winner", matchId: "m88" } },
  { id: "m96", round: "round_of_16", label: "W85 vs W87", homeSource: { type: "winner", matchId: "m85" }, awaySource: { type: "winner", matchId: "m87" } },
  { id: "m97", round: "quarter_finals", label: "W89 vs W90", homeSource: { type: "winner", matchId: "m89" }, awaySource: { type: "winner", matchId: "m90" } },
  { id: "m98", round: "quarter_finals", label: "W91 vs W92", homeSource: { type: "winner", matchId: "m91" }, awaySource: { type: "winner", matchId: "m92" } },
  { id: "m99", round: "quarter_finals", label: "W93 vs W94", homeSource: { type: "winner", matchId: "m93" }, awaySource: { type: "winner", matchId: "m94" } },
  { id: "m100", round: "quarter_finals", label: "W95 vs W96", homeSource: { type: "winner", matchId: "m95" }, awaySource: { type: "winner", matchId: "m96" } },
  { id: "m101", round: "semi_finals", label: "W97 vs W98", homeSource: { type: "winner", matchId: "m97" }, awaySource: { type: "winner", matchId: "m98" } },
  { id: "m102", round: "semi_finals", label: "W99 vs W100", homeSource: { type: "winner", matchId: "m99" }, awaySource: { type: "winner", matchId: "m100" } },
  { id: "m103", round: "third_place", label: "3.er puesto", homeSource: { type: "loser", matchId: "m101" }, awaySource: { type: "loser", matchId: "m102" } },
  { id: "m104", round: "final", label: "Final", homeSource: { type: "winner", matchId: "m101" }, awaySource: { type: "winner", matchId: "m102" } },
];

export const BRACKET_ROUNDS_ORDER: BracketRound[] = [
  "round_of_32",
  "round_of_16",
  "quarter_finals",
  "semi_finals",
  "third_place",
  "final",
];

export const BRACKET_MATCH_ROUNDS: Record<string, BracketRound> = Object.fromEntries(
  BRACKET_MATCH_SLOTS.map((m) => [m.id, m.round]),
) as Record<string, BracketRound>;

export const R32_BRACKET_ORDER = [
  "m73", "m74", "m75", "m76", "m77", "m78", "m79", "m80",
  "m81", "m82", "m83", "m84", "m85", "m86", "m87", "m88",
] as const;

export const BRACKET_FEED: Record<string, readonly [string, string]> = {
  m89: ["m73", "m75"],
  m90: ["m74", "m77"],
  m91: ["m76", "m78"],
  m92: ["m79", "m80"],
  m93: ["m83", "m84"],
  m94: ["m81", "m82"],
  m95: ["m86", "m88"],
  m96: ["m85", "m87"],
  m97: ["m89", "m90"],
  m98: ["m91", "m92"],
  m99: ["m93", "m94"],
  m100: ["m95", "m96"],
  m101: ["m97", "m98"],
  m102: ["m99", "m100"],
  m103: ["m101", "m102"],
  m104: ["m101", "m102"],
};

export interface BracketResolveInput {
  groupStandings: GroupStandings;
  qualifyingThirdGroups: string[];
  knockoutWinners: KnockoutWinners;
}

function teamFromStandings(
  standings: GroupStandings,
  group: string,
  position: 1 | 2 | 3 | 4,
): BracketTeamInfo | null {
  const order = standings[group];
  if (!order || order.length < position) return null;
  return getWorldCupTeamById(order[position - 1]) ?? null;
}

export interface ThirdPlaceCandidate {
  group: string;
  team: BracketTeamInfo;
}

export function getThirdPlaceCandidates(standings: GroupStandings): ThirdPlaceCandidate[] {
  const result: ThirdPlaceCandidate[] = [];
  for (const group of WORLD_CUP_GROUP_LETTERS) {
    const order = standings[group];
    if (!order || order.length < 3) continue;
    const team = getWorldCupTeamById(order[2]);
    if (team) result.push({ group, team });
  }
  return result;
}

function buildThirdPlaceSlotTeams(
  standings: GroupStandings,
  qualifyingThirdGroups: string[],
): Map<string, BracketTeamInfo> {
  const slotTeams = new Map<string, BracketTeamInfo>();
  const slotMap = lookupThirdPlaceSlots(qualifyingThirdGroups);
  if (!slotMap) return slotTeams;

  for (const [matchId, groupLetter] of Object.entries(slotMap)) {
    const team = teamFromStandings(standings, groupLetter, 3);
    if (team) slotTeams.set(matchId, team);
  }

  return slotTeams;
}

function resolveParticipant(
  source: BracketMatchSlot["homeSource"],
  input: BracketResolveInput,
  thirdSlots: Map<string, BracketTeamInfo>,
  matchId: string,
): BracketTeamInfo | null {
  const { groupStandings: standings, knockoutWinners: winners } = input;

  switch (source.type) {
    case "group":
      return teamFromStandings(standings, source.group, source.position);
    case "third_eligible":
      return thirdSlots.get(matchId) ?? null;
    case "winner": {
      const winnerId = winners[source.matchId];
      return winnerId ? (getWorldCupTeamById(winnerId) ?? null) : null;
    }
    case "loser": {
      const winnerId = winners[source.matchId];
      if (!winnerId) return null;
      const slot = BRACKET_MATCH_SLOTS.find((m) => m.id === source.matchId);
      if (!slot) return null;
      const parentThirdSlots = buildThirdPlaceSlotTeams(standings, input.qualifyingThirdGroups);
      const home = resolveParticipant(slot.homeSource, input, parentThirdSlots, slot.id);
      const away = resolveParticipant(slot.awaySource, input, parentThirdSlots, slot.id);
      if (home?.id === winnerId) return away;
      if (away?.id === winnerId) return home;
      return null;
    }
    default:
      return null;
  }
}

export function resolveBracketMatches(input: BracketResolveInput): ResolvedBracketMatch[] {
  const thirdSlots = buildThirdPlaceSlotTeams(input.groupStandings, input.qualifyingThirdGroups);

  return BRACKET_MATCH_SLOTS.map((slot) => ({
    id: slot.id,
    round: slot.round,
    label: slot.label,
    home: resolveParticipant(slot.homeSource, input, thirdSlots, slot.id),
    away: resolveParticipant(slot.awaySource, input, thirdSlots, slot.id),
    winnerId: input.knockoutWinners[slot.id] ?? null,
  }));
}

export function areGroupStandingsComplete(standings: GroupStandings): boolean {
  return WORLD_CUP_GROUP_LETTERS.every((g) => {
    const order = standings[g];
    return order?.length === 4 && new Set(order).size === 4;
  });
}

export function areThirdPlacePicksComplete(groups: string[]): boolean {
  if (groups.length !== 8) return false;
  const unique = new Set(groups);
  if (unique.size !== 8) return false;
  return groups.every((g) =>
    WORLD_CUP_GROUP_LETTERS.includes(g as (typeof WORLD_CUP_GROUP_LETTERS)[number]),
  );
}

export function isKnockoutReady(input: BracketResolveInput): boolean {
  return (
    areGroupStandingsComplete(input.groupStandings) &&
    areThirdPlacePicksComplete(input.qualifyingThirdGroups) &&
    lookupThirdPlaceSlots(input.qualifyingThirdGroups) !== null
  );
}

export function isBracketComplete(input: BracketResolveInput): boolean {
  if (!isKnockoutReady(input)) return false;
  const matches = resolveBracketMatches(input);
  return matches.every((m) => {
    if (!m.home || !m.away) return false;
    const winner = input.knockoutWinners[m.id];
    return winner === m.home.id || winner === m.away.id;
  });
}

export function pruneInvalidWinners(input: BracketResolveInput): KnockoutWinners {
  const pruned = { ...input.knockoutWinners };
  const matches = resolveBracketMatches({ ...input, knockoutWinners: pruned });

  for (const match of matches) {
    const winnerId = pruned[match.id];
    if (!winnerId) continue;
    if (!match.home || !match.away) {
      delete pruned[match.id];
      continue;
    }
    if (winnerId !== match.home.id && winnerId !== match.away.id) {
      delete pruned[match.id];
    }
  }

  return pruned;
}

export function validateGroupStandings(
  standings: GroupStandings,
  expectedTeamsByGroup: Record<string, BracketTeamInfo[]>,
): string | null {
  for (const [group, teams] of Object.entries(expectedTeamsByGroup)) {
    const order = standings[group];
    if (!order || order.length !== 4) {
      return `Completa la clasificación del grupo ${group}.`;
    }
    const expectedIds = new Set(teams.map((t) => t.id));
    for (const id of order) {
      if (!expectedIds.has(id)) return `Selección inválida en el grupo ${group}.`;
    }
    if (new Set(order).size !== 4) {
      return `Hay selecciones duplicadas en el grupo ${group}.`;
    }
  }
  return null;
}

export function validateQualifyingThirdGroups(groups: string[]): string | null {
  if (groups.length !== 8) return "Elige exactamente 8 mejores terceros.";
  if (new Set(groups).size !== 8) return "No puedes repetir grupos en los mejores terceros.";
  if (lookupThirdPlaceSlots(groups) === null) {
    return "Esta combinación de terceros no es válida para el cuadro FIFA.";
  }
  return null;
}

export function validateKnockoutWinners(input: BracketResolveInput): string | null {
  if (!isKnockoutReady(input)) {
    return "Completa grupos y mejores terceros antes de las eliminatorias.";
  }
  const matches = resolveBracketMatches(input);
  for (const match of matches) {
    const winnerId = input.knockoutWinners[match.id];
    if (!winnerId) return `Elige el ganador de ${match.label}.`;
    if (!match.home || !match.away) return `El cruce ${match.label} aún no está definido.`;
    if (winnerId !== match.home.id && winnerId !== match.away.id) {
      return `Ganador inválido en ${match.label}.`;
    }
  }
  return null;
}

export function computeBracketLayout(): Map<string, number> {
  const positions = new Map<string, number>();
  R32_BRACKET_ORDER.forEach((id, index) => positions.set(id, index));

  function positionFor(id: string): number {
    const cached = positions.get(id);
    if (cached !== undefined) return cached;
    const feed = BRACKET_FEED[id];
    if (!feed) return 0;
    const pos = (positionFor(feed[0]) + positionFor(feed[1])) / 2;
    positions.set(id, pos);
    return pos;
  }

  for (const slot of BRACKET_MATCH_SLOTS) {
    if (slot.round !== "round_of_32") positionFor(slot.id);
  }

  return positions;
}
