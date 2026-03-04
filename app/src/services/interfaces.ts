import type {
  CourseProgress,
  Credential,
  LeaderboardEntry,
  StreakData,
  Achievement,
  ActivityItem,
  UserProfile,
  TimeFilter,
  SkillScore,
  LessonContent,
} from "@/types";

/**
 * Service interfaces for Superteam Academy.
 *
 * Each service has a local/stub implementation and can be swapped
 * to an on-chain implementation when the program is connected.
 *
 * See docs/INTEGRATION.md for PDA derivation, instruction parameters,
 * and event signatures these interfaces map to.
 */

/* ── Auth Service ── */

export interface AuthService {
  /** Get the current authenticated user, or null */
  getCurrentUser(): Promise<UserProfile | null>;

  /** Update user profile fields */
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;

  /** Link a wallet address to the current user */
  linkWallet(walletAddress: string, signature: string): Promise<void>;

  /** Check if a wallet is linked */
  isWalletLinked(walletAddress: string): Promise<boolean>;

  /** Delete account */
  deleteAccount(): Promise<void>;

  /** Export user data */
  exportData(): Promise<Record<string, unknown>>;
}

/* ── Progress Service ── */

export interface ProgressService {
  /** Get progress for a user in a specific course */
  getProgress(wallet: string, courseId: string): Promise<CourseProgress | null>;

  /** Get all enrollments for a wallet */
  getAllEnrollments(wallet: string): Promise<CourseProgress[]>;

  /** Enroll in a course (learner signs directly on-chain) */
  enroll(wallet: string, courseId: string): Promise<{ txSignature: string }>;

  /**
   * Complete a lesson (backend-signed transaction).
   * Stubbed: records locally, returns mock XP.
   * On-chain: backend validates answer → signs complete_lesson tx.
   */
  completeLesson(
    wallet: string,
    courseId: string,
    lessonIndex: number,
    code?: string,
  ): Promise<{ xpEarned: number; txSignature: string | null }>;

  /**
   * Finalize a course (backend-signed).
   * Stubbed: marks course complete, returns mock bonus XP.
   */
  finalizeCourse(
    wallet: string,
    courseId: string,
  ): Promise<{ bonusXp: number; txSignature: string | null }>;

  /** Close enrollment and reclaim rent (learner signs) */
  closeEnrollment(
    wallet: string,
    courseId: string,
  ): Promise<{ txSignature: string }>;
}

/* ── XP Service ── */

export interface XpService {
  /** Get XP balance for a wallet (Token-2022 ATA balance on-chain) */
  getBalance(wallet: string): Promise<number>;

  /** Get level derived from XP: floor(sqrt(xp / 100)) */
  getLevel(wallet: string): Promise<number>;
}

/* ── Credential Service ── */

export interface CredentialService {
  /** Get all credentials (Metaplex Core NFTs) for a wallet */
  getCredentials(wallet: string): Promise<Credential[]>;

  /** Get a specific credential by mint address */
  getCredentialByMint(mintAddress: string): Promise<Credential | null>;

  /**
   * Issue credential (backend-signed).
   * Stubbed: records locally.
   */
  issueCredential(
    wallet: string,
    courseId: string,
    trackId: string,
  ): Promise<{ mintAddress: string; txSignature: string | null }>;

  /**
   * Upgrade credential attributes (backend-signed).
   * Stubbed: updates local record.
   */
  upgradeCredential(
    wallet: string,
    mintAddress: string,
    coursesCompleted: number,
    totalXp: number,
  ): Promise<{ txSignature: string | null }>;
}

/* ── Leaderboard Service ── */

export interface LeaderboardService {
  /**
   * Get leaderboard entries.
   * On-chain: indexes XP token balances via Helius DAS API.
   * Stubbed: returns mock sorted data.
   */
  getEntries(
    timeframe: TimeFilter,
    courseFilter?: string,
    page?: number,
    pageSize?: number,
  ): Promise<{ entries: LeaderboardEntry[]; total: number }>;

  /** Get rank for a specific wallet */
  getRank(wallet: string): Promise<number | null>;
}

/* ── Streak Service ── */

export interface StreakService {
  /** Get streak data for a wallet (frontend-only, localStorage) */
  getStreak(wallet: string): Promise<StreakData>;

  /** Record activity for today */
  recordActivity(wallet: string): Promise<StreakData>;

  /** Use a streak freeze */
  useFreeze(wallet: string): Promise<StreakData>;

  /** Check for milestone rewards (7, 30, 100 days) */
  checkMilestones(
    wallet: string,
  ): Promise<{ milestone: number; xpReward: number } | null>;
}

/* ── Achievement Service ── */

export interface AchievementService {
  /** Get all earned achievements for a wallet */
  getAchievements(wallet: string): Promise<Achievement[]>;

  /** Get all available achievements */
  getAllAchievementTypes(): Promise<Achievement[]>;

  /**
   * Claim an achievement (backend-signed).
   * Stubbed: records locally.
   * On-chain: award_achievement mints soulbound NFT + XP.
   */
  claimAchievement(
    wallet: string,
    achievementId: string,
  ): Promise<{ xpReward: number; txSignature: string | null }>;

  /** Check which achievements the user qualifies for */
  checkEligible(wallet: string): Promise<string[]>;
}

/* ── Activity Service ── */

export interface ActivityService {
  /** Get recent activity feed */
  getActivity(wallet: string, limit?: number): Promise<ActivityItem[]>;

  /** Record an activity event */
  recordActivity(
    wallet: string,
    item: Omit<ActivityItem, "id" | "timestamp">,
  ): Promise<void>;
}

/* ── Course Content Service ── */

export interface CourseContentService {
  /** Get lesson content (from CMS or local data) */
  getLessonContent(
    courseSlug: string,
    lessonId: string,
  ): Promise<LessonContent | null>;

  /** Get skill scores derived from course completions */
  getSkillScores(wallet: string): Promise<SkillScore[]>;
}
