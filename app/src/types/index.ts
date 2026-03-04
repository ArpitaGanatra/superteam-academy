import type { LucideIcon } from "lucide-react";

/* ── Course Types ── */

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "challenge";
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseDetail {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  topic: string;
  topicLabel: string;
  duration: string;
  lessons: number;
  completed: number;
  xp: number;
  accent: string;
  icon: LucideIcon;
  codePreview: string[];
  instructor: { name: string; role: string };
  modules: Module[];
  reviews: { name: string; rating: number; text: string }[];
}

/* ── User Types ── */

export interface UserProfile {
  id: string;
  walletAddress: string | null;
  email: string | null;
  googleId: string | null;
  githubId: string | null;
  name: string;
  username: string;
  bio: string;
  initials: string;
  avatarUrl: string | null;
  joinDate: string;
  locale: "en" | "pt-BR" | "es";
  theme: "dark" | "light" | "system";
  isPublic: boolean;
  socialLinks: {
    github?: string;
    twitter?: string;
    website?: string;
  };
}

/* ── XP & Level ── */

export function deriveLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function xpProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progress: number;
} {
  const level = deriveLevel(xp);
  const currentLevelFloor = xpForLevel(level);
  const nextLevelFloor = xpForLevel(level + 1);
  const currentLevelXp = xp - currentLevelFloor;
  const xpToNextLevel = nextLevelFloor - currentLevelFloor;
  const progress = xpToNextLevel > 0 ? currentLevelXp / xpToNextLevel : 0;
  return { level, currentLevelXp, xpToNextLevel, progress };
}

/* ── Progress Types ── */

export interface CourseProgress {
  courseId: string;
  enrolledAt: number; // unix timestamp
  completedAt: number | null;
  completedLessons: number[];
  totalLessons: number;
  credentialAsset: string | null;
}

/* ── Streak Types ── */

export type DayStatus = "active" | "freeze" | "missed";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
  freezesTotal: number;
  todayCompleted: boolean;
  history: Record<string, DayStatus>; // "YYYY-MM-DD" → status
}

/* ── Achievement Types ── */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  mintAddress?: string;
}

/* ── Credential Types ── */

export interface Credential {
  id: string;
  track: string;
  level: string;
  accent: string;
  mintAddress: string;
  earnedAt: string;
  coursesCompleted: number;
  totalXp: number;
  metadataUri?: string;
  collectionAddress?: string;
}

/* ── Leaderboard Types ── */

export interface LeaderboardEntry {
  rank: number;
  name: string;
  username: string;
  initials: string;
  level: number;
  xp: number;
  streak: number;
  accent: string;
  walletAddress?: string;
  isCurrentUser?: boolean;
}

export type TimeFilter = "weekly" | "monthly" | "all-time";
export type CourseFilter = "all" | string;

/* ── Activity Types ── */

export interface ActivityItem {
  id: string;
  type:
    | "lesson_complete"
    | "course_start"
    | "course_complete"
    | "achievement"
    | "streak";
  title: string;
  courseName?: string;
  xp?: number;
  timestamp: string;
}

/* ── Skill Radar ── */

export interface SkillScore {
  name: string;
  value: number; // 0-100
}

/* ── Lesson Content ── */

export interface TestCase {
  name: string;
  input: string;
  expected: string;
}

export interface LessonContent {
  courseSlug: string;
  lessonId: string;
  title: string;
  type: "video" | "reading" | "challenge";
  markdown: string;
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  testCases?: TestCase[];
}
