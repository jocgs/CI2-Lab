import {
  getBetsForUser,
  getCurrentUser,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  getFriendsForUser,
  getGlobalRanking,
  getGroupsForUser,
  getMatches,
  getStreakForUser,
  getTeams,
} from "@/lib/db";
import { computeUserAchievements, FANTASY_COMPETITION_ID } from "@/lib/achievements";
import { getBolaDeCristalOfficialAnswers } from "@/lib/bola-de-cristal-official-answers";
import { evaluateBolaDeCristalPicks } from "@/lib/bola-de-cristal-evaluation";
import { getFantasyTeamByUserAndCompetition, getNationalTeamsByCompetition } from "@/lib/fantasy-db";
import { MOCK_TOURNAMENT } from "@/lib/mocks/tournament-teams";
import { getUserTournamentPicks } from "@/lib/picks-db";
import { getTotalShopAvatarsCount } from "@/lib/shop-avatars";

export const NATIONAL_TEAM_COMPETITION_ID = "world_cup_2026";

export async function getProfileUserContext() {
  const user = await getCurrentUser();

  const [
    streak,
    bets,
    groups,
    friends,
    receivedRequests,
    sentRequests,
    teams,
    nationalTeams,
    matches,
    globalRanking,
    fantasyTeam,
    tournamentPicks,
  ] = await Promise.all([
    getStreakForUser(user.id),
    getBetsForUser(user.id),
    getGroupsForUser(user.id),
    getFriendsForUser(user.id),
    getFriendRequestsReceived(user.id),
    getFriendRequestsSent(user.id),
    getTeams(),
    getNationalTeamsByCompetition(NATIONAL_TEAM_COMPETITION_ID),
    getMatches(),
    getGlobalRanking(),
    getFantasyTeamByUserAndCompetition(user.id, FANTASY_COMPETITION_ID),
    getUserTournamentPicks(user.id, MOCK_TOURNAMENT.id),
  ]);

  const bolaDeCristal = evaluateBolaDeCristalPicks(
    fantasyTeam,
    tournamentPicks,
    getBolaDeCristalOfficialAnswers(MOCK_TOURNAMENT.id),
  );
  const clubTeamIds = teams.map((t) => t.id);

  const unlockedAvatarsCount = user.unlockedAvatarIds?.length ?? 0;
  const totalShopAvatars = getTotalShopAvatarsCount();

  const achievements = computeUserAchievements({
    userId: user.id,
    streak,
    bets,
    matches,
    friendsCount: friends.length,
    groupsCount: groups.length,
    groupLeaderWinCount: user.groupLeaderWinCount ?? 0,
    globalRanking,
    fantasyTeam,
    unlockedAvatarsCount,
    totalShopAvatars,
    tournamentPicks,
    bolaDeCristal,
    clubTeamIds,
  });

  const resolvedBets = bets.filter((b) => b.status !== "PENDING");
  const wonBets = resolvedBets.filter((b) => b.status === "WON");
  const totalPoints = wonBets.reduce((sum, b) => sum + b.points, 0);
  const accuracy =
    resolvedBets.length === 0
      ? 0
      : Math.round((wonBets.length / resolvedBets.length) * 100);

  const supportedTeamIds = user.supportedTeamIds ?? [];
  const supportedTeams = teams.filter((team) => supportedTeamIds.includes(team.id));
  const supportedNationalTeam = nationalTeams.find(
    (team) => team.id === user.supportedNationalTeamId,
  );

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  return {
    user,
    streak,
    friends,
    receivedRequests,
    sentRequests,
    teams,
    nationalTeams,
    achievements,
    unlockedAchievements,
    totalAchievements: achievements.length,
    stats: {
      totalPoints,
      coins: user.coins ?? 0,
      wonCount: wonBets.length,
      resolvedCount: resolvedBets.length,
      accuracy,
      currentStreak: streak.current,
      bestStreak: streak.best,
    },
    supportedTeamIds,
    supportedTeams,
    supportedNationalTeam,
  };
}
