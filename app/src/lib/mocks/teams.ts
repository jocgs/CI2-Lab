import type { Team } from "@/types/domain";

const CREST = (id: number) => `https://crests.football-data.org/${id}.svg`;

export const MOCK_TEAMS: Team[] = [
  { id: "team_rma", name: "Real Madrid",          shortName: "RMA", country: "ES", logoUrl: CREST(86)  },
  { id: "team_fcb", name: "FC Barcelona",          shortName: "BAR", country: "ES", logoUrl: CREST(81)  },
  { id: "team_atm", name: "Atlético de Madrid",    shortName: "ATM", country: "ES", logoUrl: CREST(78)  },
  { id: "team_seve",name: "Sevilla FC",            shortName: "SEV", country: "ES", logoUrl: CREST(559) },
  { id: "team_bet", name: "Real Betis",            shortName: "BET", country: "ES", logoUrl: CREST(90)  },
  { id: "team_val", name: "Valencia CF",           shortName: "VAL", country: "ES", logoUrl: CREST(95)  },
  { id: "team_vil", name: "Villarreal CF",         shortName: "VIL", country: "ES", logoUrl: CREST(94)  },
  { id: "team_ath", name: "Athletic Club",         shortName: "ATH", country: "ES", logoUrl: CREST(77)  },
  { id: "team_rso", name: "Real Sociedad",         shortName: "RSO", country: "ES", logoUrl: CREST(92)  },
  { id: "team_gir", name: "Girona FC",             shortName: "GIR", country: "ES", logoUrl: CREST(298) },
  { id: "team_mci", name: "Manchester City",       shortName: "MCI", country: "GB", logoUrl: CREST(65)  },
  { id: "team_bay", name: "Bayern München",        shortName: "BAY", country: "DE", logoUrl: CREST(5)   },
  { id: "team_psg", name: "Paris Saint-Germain",   shortName: "PSG", country: "FR", logoUrl: CREST(524) },
  { id: "team_int", name: "Inter de Milán",        shortName: "INT", country: "IT", logoUrl: CREST(108) },
];
