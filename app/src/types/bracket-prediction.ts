/** Posición en la fase de grupos (1 = primero, 4 = eliminado). */
export type GroupPosition = 1 | 2 | 3 | 4;

export type BracketRound =
  | "round_of_32"
  | "round_of_16"
  | "quarter_finals"
  | "semi_finals"
  | "third_place"
  | "final";

/** Orden de clasificación por grupo: [1º, 2º, 3º, 4º] como IDs de selección. */
export type GroupStandings = Record<string, [string, string, string, string]>;

/** Ganadores elegidos en eliminatorias: matchId → teamId. */
export type KnockoutWinners = Record<string, string>;

export interface UserWorldCupBracketPrediction {
  userId: string;
  tournamentId: string;
  /** Grupos A–L completados con las 4 selecciones ordenadas. */
  groupStandings: GroupStandings;
  /** 8 letras de grupo cuyos terceros clasifican a dieciseisavos. */
  qualifyingThirdGroups: string[];
  /** Ganador elegido en cada partido de eliminatorias. */
  knockoutWinners: KnockoutWinners;
  createdAt: string;
  updatedAt: string;
}

export interface BracketTeamInfo {
  id: string;
  name: string;
  crestUrl?: string;
  group: string;
  marketOdds: number;
}

export interface BracketMatchSlot {
  id: string;
  round: BracketRound;
  label: string;
  homeSource: BracketParticipantSource;
  awaySource: BracketParticipantSource;
}

export type BracketParticipantSource =
  | { type: "group"; group: string; position: GroupPosition }
  | { type: "third_eligible"; eligibleGroups: string[] }
  | { type: "winner"; matchId: string }
  | { type: "loser"; matchId: string };

export interface ResolvedBracketMatch {
  id: string;
  round: BracketRound;
  label: string;
  home: BracketTeamInfo | null;
  away: BracketTeamInfo | null;
  winnerId: string | null;
}

export const BRACKET_ROUND_LABELS: Record<BracketRound, string> = {
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos",
  quarter_finals: "Cuartos",
  semi_finals: "Semifinales",
  third_place: "3.er puesto",
  final: "Final",
};
