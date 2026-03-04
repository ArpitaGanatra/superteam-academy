import type { StreakService } from "./interfaces";
import type { StreakData, DayStatus } from "@/types";

const STORAGE_KEY = "academy_streaks";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreak(wallet: string): StreakData {
  if (typeof window === "undefined") {
    return defaultStreak();
  }
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[wallet] ?? defaultStreak();
  } catch {
    return defaultStreak();
  }
}

function saveStreak(wallet: string, data: StreakData): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  all[wallet] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function defaultStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    freezesRemaining: 3,
    freezesTotal: 3,
    todayCompleted: false,
    history: {},
  };
}

function calculateStreak(history: Record<string, DayStatus>): number {
  let streak = 0;
  const d = new Date();

  // Start from today and count backwards
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const status = history[key];

    if (status === "active" || status === "freeze") {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Streak service using localStorage.
 * Streaks are frontend-only per competition spec.
 */
export class LocalStreakService implements StreakService {
  async getStreak(wallet: string): Promise<StreakData> {
    const data = loadStreak(wallet);

    // Recalculate current streak
    data.currentStreak = calculateStreak(data.history);
    data.todayCompleted = data.history[todayKey()] === "active";

    return data;
  }

  async recordActivity(wallet: string): Promise<StreakData> {
    const data = loadStreak(wallet);
    const today = todayKey();

    if (data.history[today] === "active") {
      return data; // Already recorded today
    }

    data.history[today] = "active";
    data.todayCompleted = true;
    data.currentStreak = calculateStreak(data.history);

    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    saveStreak(wallet, data);
    return data;
  }

  async useFreeze(wallet: string): Promise<StreakData> {
    const data = loadStreak(wallet);
    const yesterday = yesterdayKey();

    if (data.freezesRemaining <= 0) {
      throw new Error("No freezes remaining");
    }

    if (!data.history[yesterday]) {
      data.history[yesterday] = "freeze";
      data.freezesRemaining--;
      data.currentStreak = calculateStreak(data.history);
    }

    saveStreak(wallet, data);
    return data;
  }

  async checkMilestones(
    wallet: string,
  ): Promise<{ milestone: number; xpReward: number } | null> {
    const data = loadStreak(wallet);
    const milestones = [
      { days: 7, xp: 70 },
      { days: 30, xp: 300 },
      { days: 100, xp: 1000 },
    ];

    for (const m of milestones) {
      if (data.currentStreak === m.days) {
        return { milestone: m.days, xpReward: m.xp };
      }
    }

    return null;
  }
}
