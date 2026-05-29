export type Position = "GK" | "DEF" | "MID" | "FWD";
export type BetStatus = "PENDING" | "WON" | "LOST";

export interface FantasyPlayer {
  id: string;
  name: string;
  position: Position;
  nationalTeamId: string;
  nationalTeamName: string;
  competitionId: string;
  photoUrl?: string;
  isActive: boolean;
  totalFantasyPoints: number;
}

export interface FantasyNationalTeam {
  id: string;
  name: string;
  flagUrl?: string;
  logoUrl?: string;
  competitionId: string;
  group?: string;
  /** Cuota de apuesta (p.ej. 5.0). Determina los puntos bonus si la predicción es correcta. */
  odds?: number;
}

export interface FantasyStartingEleven {
  goalkeeperId: string;
  defenderIds: [string, string, string, string];
  midfielderIds: [string, string, string];
  forwardIds: [string, string, string];
}

export interface FantasyBench {
  goalkeeperId: string;
  defenderId: string;
  midfielderId: string;
  forwardId: string;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  competitionId: string;
  /** `null` = equipo del ranking global; id de liga = equipo solo para esa liga. */
  leagueId?: string | null;
  teamName: string;
  startingEleven: FantasyStartingEleven;
  bench: FantasyBench;
  captainId: string;
  championTeamId?: string;
  surpriseTeamId?: string;
  disappointmentTeamId?: string;
  tournamentMvpPlayerId?: string;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
}

export interface FantasyPlayerMatchStats {
  id: string;
  competitionId: string;
  matchId: string;
  playerId: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  penaltySaved: number;
  penaltyMissed: number;
  mvp: boolean;
  started: boolean;
  minutesPlayed: number;
  fantasyPoints: number;
}

export interface FantasyCompetitionBonuses {
  id: string;
  competitionId: string;
  fantasyTeamId: string;
  championTeamBonus: number;
  surpriseTeamBonus: number;
  disappointmentTeamBonus: number;
  tournamentMvpBonus: number;
  totalBonus: number;
}

export interface FantasyRankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  teamName: string;
  totalPoints: number;
  captainName: string;
  championTeamName: string;
  pointsDiff: number;
  label: string;
}

export interface FantasyLeague {
  id: string;
  name: string;
  competitionId: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
}

export interface FantasyLeagueRankingEntry extends FantasyRankingEntry {
  leagueRank: number;
}

export interface FantasyTeamPointsBreakdown {
  totalPoints: number;
  playerBreakdown: Array<{
    playerId: string;
    name: string;
    position: Position;
    basePoints: number;
    captainBonus: number;
    finalPoints: number;
    wasSubstituted: boolean;
    substituteId?: string;
  }>;
  automaticSubstitutions: Array<{
    starterId: string;
    benchId: string;
    reason: string;
  }>;
  bonuses: {
    championTeamBonus: number;
    surpriseTeamBonus: number;
    disappointmentTeamBonus: number;
    tournamentMvpBonus: number;
  };
}
