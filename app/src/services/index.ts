/**
 * Service layer barrel export.
 *
 * All services use localStorage stubs by default.
 * Swap implementations when connecting to on-chain program.
 *
 * Usage:
 *   import { progressService, xpService } from "@/services";
 *   const progress = await progressService.getProgress(wallet, courseId);
 */

export { LocalProgressService } from "./progress.service";
export { LocalXpService, addXp } from "./xp.service";
export { LocalStreakService } from "./streak.service";
export { LocalCredentialService } from "./credential.service";
export { LocalLeaderboardService } from "./leaderboard.service";
export { LocalAchievementService } from "./achievement.service";
export { LocalActivityService } from "./activity.service";

// Re-export interfaces
export type {
  ProgressService,
  XpService,
  StreakService,
  CredentialService,
  LeaderboardService,
  AchievementService,
  ActivityService,
  AuthService,
  CourseContentService,
} from "./interfaces";

// Singleton instances
import { LocalProgressService } from "./progress.service";
import { LocalXpService } from "./xp.service";
import { LocalStreakService } from "./streak.service";
import { LocalCredentialService } from "./credential.service";
import { LocalLeaderboardService } from "./leaderboard.service";
import { LocalAchievementService } from "./achievement.service";
import { LocalActivityService } from "./activity.service";

export const progressService = new LocalProgressService();
export const xpService = new LocalXpService();
export const streakService = new LocalStreakService();
export const credentialService = new LocalCredentialService();
export const leaderboardService = new LocalLeaderboardService();
export const achievementService = new LocalAchievementService();
export const activityService = new LocalActivityService();
