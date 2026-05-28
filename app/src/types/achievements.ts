export type AchievementCategory =
  | "streak"
  | "points"
  | "friends"
  | "groups"
  | "ranking"
  | "fantasy";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
}

export interface UserAchievement {
  definition: AchievementDefinition;
  unlocked: boolean;
  progress: number;
  current: number;
  target: number;
}
