import type { Bet, Match, RankingEntry, UserStreak } from "@/types/domain";
import type { FantasyTeam } from "@/types/fantasy";
import type { AchievementDefinition, UserAchievement } from "@/types/achievements";
import type { BolaDeCristalEvaluation } from "@/lib/bola-de-cristal-evaluation";
import { getPointsForBet, maxConsecutiveTeamOutcomeStreak } from "@/lib/scoring";
import { getTotalShopAvatarsCount } from "@/lib/shop-avatars";
import type { UserTournamentPicks } from "@/types/picks";

const FANTASY_COMPETITION_ID = "world_cup_2026";

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "streak_5", category: "streak", emoji: "🔥", title: "En racha", description: "Consigue una racha de 5 aciertos seguidos" },
  { id: "streak_10", category: "streak", emoji: "", title: "Imparable", description: "Consigue una racha de 10 aciertos seguidos" },
  { id: "streak_20", category: "streak", emoji: "⚡", title: "Máquina de acertar", description: "Consigue una racha de 20 aciertos seguidos" },
  { id: "streak_50", category: "streak", emoji: "🌟", title: "Leyenda del acierto", description: "Consigue una racha de 50 aciertos seguidos" },
  { id: "streak_100", category: "streak", emoji: "👑", title: "Oráculo del fútbol", description: "Consigue una racha de 100 aciertos seguidos" },

  { id: "points_week_10", category: "points", emoji: "💰", title: "Semana redonda", description: "Suma 10 puntos en una semana" },
  {
    id: "points_team_streak_8",
    category: "points",
    emoji: "🛡️",
    title: "La vieja confiable",
    description:
      "Acierta el resultado (1X2) del mismo equipo de club en 8 partidos seguidos",
  },

  { id: "friends_1", category: "friends", emoji: "👋", title: "Primer amigo", description: "Ten al menos 1 amigo" },
  { id: "friends_5", category: "friends", emoji: "👥", title: "Cuadrilla", description: "Ten al menos 5 amigos" },
  { id: "friends_10", category: "friends", emoji: "🌐", title: "Influencer", description: "Ten al menos 10 amigos" },

  { id: "groups_1", category: "groups", emoji: "🏘️", title: "Primer grupo", description: "Participa en 1 grupo" },
  { id: "groups_5", category: "groups", emoji: "🏟️", title: "Social", description: "Participa en 5 grupos" },
  { id: "groups_10", category: "groups", emoji: "🌆", title: "Multiporra", description: "Participa en 10 grupos" },
  {
    id: "groups_porra_win_1",
    category: "groups",
    emoji: "🏅",
    title: "Rey del grupo",
    description: "Gana un grupo quedando 1º en el ranking de la liga",
  },
  {
    id: "groups_porra_win_5",
    category: "groups",
    emoji: "👑",
    title: "Dominador",
    description: "Gana grupos 5 veces (cada vez que tomas el liderato cuenta)",
  },
  {
    id: "groups_porra_win_10",
    category: "groups",
    emoji: "🎖️",
    title: "Leyenda de la porra",
    description: "Gana grupos 10 veces (cada vez que tomas el liderato cuenta)",
  },

  { id: "rank_top_50", category: "ranking", emoji: "📊", title: "Top 50", description: "Entra en el top 50 del ranking global" },
  { id: "rank_top_20", category: "ranking", emoji: "📈", title: "Top 20", description: "Entra en el top 20 del ranking global" },
  { id: "rank_top_10", category: "ranking", emoji: "🎖️", title: "Top 10", description: "Entra en el top 10 del ranking global" },
  { id: "rank_top_5", category: "ranking", emoji: "🏆", title: "Top 5", description: "Entra en el top 5 del ranking global" },
  { id: "rank_top_3", category: "ranking", emoji: "🥉", title: "Podio", description: "Entra en el top 3 del ranking global" },
  { id: "rank_top_2", category: "ranking", emoji: "🥈", title: "Subcampeón", description: "Entra en el top 2 del ranking global" },
  { id: "rank_top_1", category: "ranking", emoji: "🥇", title: "Número 1", description: "Lidera el ranking global" },

  { id: "fantasy_first_team", category: "fantasy", emoji: "🎯", title: "Mánager Fantasy", description: "Crea tu primer equipo Fantasy" },
  { id: "fantasy_streak_5", category: "fantasy", emoji: "✨", title: "Fantasy en llamas", description: "Con equipo Fantasy, consigue 5 victorias seguidas en porras" },
  {
    id: "fantasy_bola_1",
    category: "fantasy",
    emoji: "🔮",
    title: "Vidente",
    description: "Acierta al menos 1 predicción de Bola de cristal ya resuelta",
  },
  {
    id: "fantasy_bola_25",
    category: "fantasy",
    emoji: "🌙",
    title: "Oráculo en ciernes",
    description: "Acierta el 25% de tus predicciones de Bola de cristal resueltas",
  },
  {
    id: "fantasy_bola_50",
    category: "fantasy",
    emoji: "✴️",
    title: "Bola de cristal pulida",
    description: "Acierta el 50% de tus predicciones de Bola de cristal resueltas",
  },
  {
    id: "fantasy_bola_100",
    category: "fantasy",
    emoji: "💎",
    title: "Profeta del Mundial",
    description: "Acierta el 100% de tus predicciones de Bola de cristal resueltas",
  },
  {
    id: "fantasy_bola_all_teams",
    category: "fantasy",
    emoji: "🏳️",
    title: "Maestro de selecciones",
    description:
      "Acierta todas tus predicciones de Bola de cristal sobre selecciones (las ya resueltas)",
  },
  {
    id: "fantasy_bola_all_players",
    category: "fantasy",
    emoji: "⭐",
    title: "Ojeador de élite",
    description:
      "Acierta todas tus predicciones de Bola de cristal sobre jugadores (las ya resueltas)",
  },

  {
    id: "collectibles_first",
    category: "collectibles",
    emoji: "🎁",
    title: "Primera mascota",
    description: "Desbloquea tu primera mascota en la tienda",
  },
  {
    id: "collectibles_25",
    category: "collectibles",
    emoji: "🧩",
    title: "Coleccionista novato",
    description: "Desbloquea el 25% de las mascotas de la tienda",
  },
  {
    id: "collectibles_50",
    category: "collectibles",
    emoji: "🎒",
    title: "Coleccionista experto",
    description: "Desbloquea el 50% de las mascotas de la tienda",
  },
  {
    id: "collectibles_100",
    category: "collectibles",
    emoji: "🏆",
    title: "Colección completa",
    description: "Desbloquea todas las mascotas de la tienda",
  },
];

const CATEGORY_LABELS: Record<AchievementDefinition["category"], string> = {
  streak: "Rachas",
  points: "Puntos",
  friends: "Amigos",
  groups: "Grupos",
  ranking: "Ranking",
  fantasy: "Fantasy",
  collectibles: "Coleccionables",
};

function progressValue(current: number, target: number): number {
  if (target <= 0) return current > 0 ? 100 : 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function buildAchievement(
  definition: AchievementDefinition,
  current: number,
  target: number,
): UserAchievement {
  const capped = Math.min(current, target);
  return {
    definition,
    unlocked: current >= target,
    progress: progressValue(capped, target),
    current: capped,
    target,
  };
}

function pointsInLastWeek(bets: Bet[], matches: Match[]): number {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return bets.reduce((sum, bet) => {
    const match = matchById.get(bet.matchId);
    if (!match || match.status !== "FINISHED") return sum;
    if (new Date(match.kickoffAt).getTime() < weekAgo) return sum;
    return sum + getPointsForBet(bet, match);
  }, 0);
}

function rankUnlocked(rank: number | null, maxPosition: number): boolean {
  return rank !== null && rank <= maxPosition;
}

function globalRank(userId: string, ranking: RankingEntry[]): number | null {
  const index = ranking.findIndex((e) => e.userId === userId);
  return index === -1 ? null : index + 1;
}

export interface AchievementContext {
  userId: string;
  streak: UserStreak;
  bets: Bet[];
  matches: Match[];
  friendsCount: number;
  groupsCount: number;
  /** Veces que el usuario ha tomado el 1º puesto en un grupo. */
  groupLeaderWinCount: number;
  globalRanking: RankingEntry[];
  fantasyTeam: FantasyTeam | null;
  unlockedAvatarsCount: number;
  totalShopAvatars: number;
  tournamentPicks: UserTournamentPicks | null;
  bolaDeCristal: BolaDeCristalEvaluation;
  clubTeamIds: string[];
}

export interface UserAchievementWithMeta extends UserAchievement {
  rankPosition?: number | null;
}

export function computeUserAchievements(ctx: AchievementContext): UserAchievementWithMeta[] {
  const streakScore = Math.max(ctx.streak.current, ctx.streak.best);
  const weekPoints = pointsInLastWeek(ctx.bets, ctx.matches);
  const rank = globalRank(ctx.userId, ctx.globalRanking);
  const hasFantasy = Boolean(ctx.fantasyTeam);
  const totalMascots = ctx.totalShopAvatars || getTotalShopAvatarsCount();
  const collectibles25Target = Math.max(1, Math.ceil(totalMascots * 0.25));
  const collectibles50Target = Math.max(1, Math.ceil(totalMascots * 0.5));
  const bola = ctx.bolaDeCristal;
  const teamOutcomeStreak = maxConsecutiveTeamOutcomeStreak(
    ctx.userId,
    ctx.bets,
    ctx.matches,
    ctx.clubTeamIds,
  );

  const values: Record<string, { current: number; target: number }> = {
    streak_5: { current: streakScore, target: 5 },
    streak_10: { current: streakScore, target: 10 },
    streak_20: { current: streakScore, target: 20 },
    streak_50: { current: streakScore, target: 50 },
    streak_100: { current: streakScore, target: 100 },
    points_week_10: { current: weekPoints, target: 10 },
    points_team_streak_8: { current: teamOutcomeStreak, target: 8 },
    friends_1: { current: ctx.friendsCount, target: 1 },
    friends_5: { current: ctx.friendsCount, target: 5 },
    friends_10: { current: ctx.friendsCount, target: 10 },
    groups_1: { current: ctx.groupsCount, target: 1 },
    groups_5: { current: ctx.groupsCount, target: 5 },
    groups_10: { current: ctx.groupsCount, target: 10 },
    groups_porra_win_1: { current: ctx.groupLeaderWinCount, target: 1 },
    groups_porra_win_5: { current: ctx.groupLeaderWinCount, target: 5 },
    groups_porra_win_10: { current: ctx.groupLeaderWinCount, target: 10 },
    rank_top_50: { current: rankUnlocked(rank, 50) ? 1 : 0, target: 1 },
    rank_top_20: { current: rankUnlocked(rank, 20) ? 1 : 0, target: 1 },
    rank_top_10: { current: rankUnlocked(rank, 10) ? 1 : 0, target: 1 },
    rank_top_5: { current: rankUnlocked(rank, 5) ? 1 : 0, target: 1 },
    rank_top_3: { current: rankUnlocked(rank, 3) ? 1 : 0, target: 1 },
    rank_top_2: { current: rankUnlocked(rank, 2) ? 1 : 0, target: 1 },
    rank_top_1: { current: rankUnlocked(rank, 1) ? 1 : 0, target: 1 },
    fantasy_first_team: { current: hasFantasy ? 1 : 0, target: 1 },
    fantasy_streak_5: { current: hasFantasy ? streakScore : 0, target: 5 },
    fantasy_bola_1: { current: bola.correctCount, target: 1 },
    fantasy_bola_25: { current: bola.correctCount, target: bola.target25 },
    fantasy_bola_50: { current: bola.correctCount, target: bola.target50 },
    fantasy_bola_100: {
      current: bola.correctCount,
      target: bola.gradableCount > 0 ? bola.gradableCount : 1,
    },
    fantasy_bola_all_teams: { current: bola.allTeamPicksCorrect ? 1 : 0, target: 1 },
    fantasy_bola_all_players: { current: bola.allPlayerPicksCorrect ? 1 : 0, target: 1 },
    collectibles_first: { current: ctx.unlockedAvatarsCount, target: 1 },
    collectibles_25: { current: ctx.unlockedAvatarsCount, target: collectibles25Target },
    collectibles_50: { current: ctx.unlockedAvatarsCount, target: collectibles50Target },
    collectibles_100: { current: ctx.unlockedAvatarsCount, target: totalMascots },
  };

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const { current, target } = values[def.id] ?? { current: 0, target: 1 };
    const achievement = buildAchievement(def, current, target);
    if (def.category === "ranking") {
      return { ...achievement, rankPosition: rank };
    }
    return achievement;
  });
}

export function groupAchievementsByCategory(
  achievements: UserAchievement[],
): { category: AchievementDefinition["category"]; label: string; items: UserAchievement[] }[] {
  const order: AchievementDefinition["category"][] = [
    "streak",
    "points",
    "friends",
    "groups",
    "ranking",
    "fantasy",
    "collectibles",
  ];

  return order.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: achievements.filter((a) => a.definition.category === category),
  }));
}

export { FANTASY_COMPETITION_ID };
