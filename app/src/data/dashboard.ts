import { courses } from "./courses";

/* ── Types ── */

export interface UserStats {
  name: string;
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  rank: number;
  totalLearners: number;
}

export type DayStatus = "active" | "freeze";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
  freezesTotal: number;
  weeklyActivity: boolean[][]; // 12 weeks × 7 days
}

// "YYYY-MM" → { dayNumber → status }  (days not listed = missed/inactive)
export type MonthlyActivity = Record<string, Record<number, DayStatus>>;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface ActivityItem {
  id: string;
  type: "lesson_complete" | "course_start" | "achievement" | "streak";
  title: string;
  courseName?: string;
  courseSlug?: string;
  itemName?: string;
  streakDays?: number;
  xp?: number;
  timestamp: string;
  timeKey?: string;
  timeValue?: number;
}

/* ── Mock Data ── */

export const userStats: UserStats = {
  name: "Learner",
  level: 7,
  totalXP: 2450,
  xpToNextLevel: 3500,
  currentLevelXP: 2450,
  rank: 42,
  totalLearners: 1284,
};

export const streakData: StreakData = {
  currentStreak: 12,
  longestStreak: 21,
  freezesRemaining: 2,
  freezesTotal: 3,
  weeklyActivity: [
    [true, true, false, true, true, false, false],
    [true, false, true, true, false, false, true],
    [false, true, true, false, true, true, false],
    [true, true, true, true, false, false, true],
    [false, false, true, true, true, false, false],
    [true, true, false, true, true, true, false],
    [true, true, true, false, true, false, true],
    [false, true, true, true, true, false, false],
    [true, false, true, true, false, true, true],
    [true, true, true, true, true, false, true],
    [true, true, false, true, true, true, true],
    [true, true, true, true, true, true, false],
  ],
};

export const monthlyActivity: MonthlyActivity = {
  "2026-01": {
    5: "active",
    8: "active",
    9: "active",
    12: "active",
    13: "active",
    14: "active",
    15: "active",
    16: "active",
    19: "active",
    20: "active",
    21: "active",
    22: "active",
    23: "active",
    26: "active",
    27: "active",
    28: "freeze",
    29: "active",
    30: "active",
  },
  "2026-02": {
    1: "active",
    2: "active",
    4: "active",
    5: "active",
    6: "active",
    8: "active",
    9: "active",
    10: "active",
    11: "freeze",
    12: "active",
    13: "active",
    14: "active",
    15: "active",
    16: "active",
    17: "active",
    18: "active",
    21: "active",
    22: "active",
    23: "active",
    24: "active",
    25: "active",
    26: "active",
    27: "active",
    28: "active",
  },
  "2026-03": {
    1: "active",
    2: "active",
    3: "active",
    4: "active",
  },
};

export const achievements: Achievement[] = [
  {
    id: "a1",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "👣",
    earnedAt: "2 weeks ago",
    rarity: "common",
  },
  {
    id: "a2",
    title: "Code Warrior",
    description: "Pass 10 code challenges",
    icon: "⚔️",
    earnedAt: "5 days ago",
    rarity: "rare",
  },
  {
    id: "a3",
    title: "Week Streak",
    description: "Learn 7 days in a row",
    icon: "🔥",
    earnedAt: "1 week ago",
    rarity: "common",
  },
  {
    id: "a4",
    title: "Deep Diver",
    description: "Complete an entire module",
    icon: "🤿",
    earnedAt: "3 days ago",
    rarity: "rare",
  },
  {
    id: "a5",
    title: "Speed Runner",
    description: "Finish 5 lessons in one day",
    icon: "⚡",
    earnedAt: "yesterday",
    rarity: "epic",
  },
  {
    id: "a6",
    title: "Bug Hunter",
    description: "Find and fix 3 challenge bugs",
    icon: "🐛",
    earnedAt: "4 days ago",
    rarity: "rare",
  },
  {
    id: "a7",
    title: "On-Chain OG",
    description: "Deploy your first program",
    icon: "🏗️",
    earnedAt: "1 week ago",
    rarity: "epic",
  },
  {
    id: "a8",
    title: "Solana Sage",
    description: "Earn 2,000 XP total",
    icon: "🧙",
    earnedAt: "2 days ago",
    rarity: "legendary",
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "act1",
    type: "lesson_complete",
    title: 'Completed "Accounts & Ownership"',
    courseName: "Solana Fundamentals",
    courseSlug: "solana-fundamentals",
    itemName: "accountsOwnership",
    xp: 100,
    timestamp: "2 hours ago",
    timeKey: "hoursAgo",
    timeValue: 2,
  },
  {
    id: "act2",
    type: "achievement",
    title: 'Earned "Solana Sage" badge',
    itemName: "solanaSage",
    timestamp: "2 hours ago",
    timeKey: "hoursAgo",
    timeValue: 2,
  },
  {
    id: "act3",
    type: "lesson_complete",
    title: 'Completed "PDAs Deep Dive"',
    courseName: "Solana Fundamentals",
    courseSlug: "solana-fundamentals",
    itemName: "pdasDeepDive",
    xp: 100,
    timestamp: "yesterday",
    timeKey: "yesterday",
  },
  {
    id: "act4",
    type: "streak",
    title: "12-day learning streak!",
    streakDays: 12,
    timestamp: "today",
    timeKey: "today",
  },
  {
    id: "act5",
    type: "course_start",
    title: 'Started "Anchor Development"',
    courseName: "Anchor Development",
    courseSlug: "anchor-development",
    itemName: "anchorDevelopment",
    timestamp: "3 days ago",
    timeKey: "daysAgo",
    timeValue: 3,
  },
  {
    id: "act6",
    type: "lesson_complete",
    title: 'Completed "Intro to Instructions"',
    courseName: "Anchor Development",
    courseSlug: "anchor-development",
    itemName: "introToInstructions",
    xp: 150,
    timestamp: "3 days ago",
    timeKey: "daysAgo",
    timeValue: 3,
  },
];

/* ── Helpers ── */

// Courses where user has made progress
export function getEnrolledCourses() {
  // For demo, simulate progress on first 3 courses
  return courses.slice(0, 3).map((c, i) => ({
    ...c,
    completed: i === 0 ? 14 : i === 1 ? 8 : 3,
  }));
}

// Courses user hasn't started
export function getRecommendedCourses() {
  return courses.slice(3, 6);
}

// Find next incomplete lesson for a course
export function getNextLesson(courseSlug: string, completedCount: number) {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return null;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  return allLessons[completedCount] ?? allLessons[0];
}
