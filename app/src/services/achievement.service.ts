import type { AchievementService } from "./interfaces";
import type { Achievement } from "@/types";

const STORAGE_KEY = "academy_achievements";

const ACHIEVEMENT_TYPES: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "footprints",
    earnedAt: "",
    rarity: "common",
    xpReward: 25,
  },
  {
    id: "course-completer",
    title: "Course Completer",
    description: "Complete an entire course",
    icon: "graduation-cap",
    earnedAt: "",
    rarity: "rare",
    xpReward: 100,
  },
  {
    id: "speed-runner",
    title: "Speed Runner",
    description: "Complete a course in under 24 hours",
    icon: "zap",
    earnedAt: "",
    rarity: "epic",
    xpReward: 200,
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "flame",
    earnedAt: "",
    rarity: "common",
    xpReward: 70,
  },
  {
    id: "monthly-master",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "crown",
    earnedAt: "",
    rarity: "rare",
    xpReward: 300,
  },
  {
    id: "consistency-king",
    title: "Consistency King",
    description: "Maintain a 100-day streak",
    icon: "trophy",
    earnedAt: "",
    rarity: "legendary",
    xpReward: 1000,
  },
  {
    id: "rust-rookie",
    title: "Rust Rookie",
    description: "Complete Solana Fundamentals",
    icon: "code",
    earnedAt: "",
    rarity: "common",
    xpReward: 50,
  },
  {
    id: "anchor-expert",
    title: "Anchor Expert",
    description: "Complete Anchor Development",
    icon: "anchor",
    earnedAt: "",
    rarity: "rare",
    xpReward: 150,
  },
  {
    id: "full-stack-solana",
    title: "Full Stack Solana",
    description: "Complete 5 courses",
    icon: "layers",
    earnedAt: "",
    rarity: "epic",
    xpReward: 500,
  },
  {
    id: "early-adopter",
    title: "Early Adopter",
    description: "Join during beta",
    icon: "star",
    earnedAt: "",
    rarity: "epic",
    xpReward: 100,
  },
  {
    id: "bug-hunter",
    title: "Bug Hunter",
    description: "Report a verified bug",
    icon: "bug",
    earnedAt: "",
    rarity: "rare",
    xpReward: 200,
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Pass all challenges on first try",
    icon: "check-circle",
    earnedAt: "",
    rarity: "legendary",
    xpReward: 500,
  },
  {
    id: "helper",
    title: "Helper",
    description: "Help another learner in the community",
    icon: "heart-handshake",
    earnedAt: "",
    rarity: "common",
    xpReward: 50,
  },
  {
    id: "first-comment",
    title: "First Comment",
    description: "Leave your first community comment",
    icon: "message-circle",
    earnedAt: "",
    rarity: "common",
    xpReward: 10,
  },
  {
    id: "top-contributor",
    title: "Top Contributor",
    description: "Reach top 10 on the leaderboard",
    icon: "medal",
    earnedAt: "",
    rarity: "legendary",
    xpReward: 500,
  },
  {
    id: "security-expert",
    title: "Security Expert",
    description: "Complete Program Security course",
    icon: "shield",
    earnedAt: "",
    rarity: "epic",
    xpReward: 200,
  },
];

function loadEarned(wallet: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[wallet] ?? [];
  } catch {
    return [];
  }
}

function saveEarned(wallet: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  all[wallet] = ids;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Stub achievement service.
 *
 * On-chain swap:
 * - getAchievements → fetch AchievementReceipt PDAs for wallet
 * - claimAchievement → POST /api/achievements/claim → backend signs award_achievement
 * - Each award mints a soulbound Metaplex Core NFT
 */
export class LocalAchievementService implements AchievementService {
  async getAchievements(wallet: string): Promise<Achievement[]> {
    const earnedIds = loadEarned(wallet);
    return ACHIEVEMENT_TYPES.filter((a) => earnedIds.includes(a.id)).map(
      (a) => ({
        ...a,
        earnedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      }),
    );
  }

  async getAllAchievementTypes(): Promise<Achievement[]> {
    return ACHIEVEMENT_TYPES;
  }

  async claimAchievement(
    wallet: string,
    achievementId: string,
  ): Promise<{ xpReward: number; txSignature: string | null }> {
    const earned = loadEarned(wallet);
    if (earned.includes(achievementId)) {
      return { xpReward: 0, txSignature: null };
    }

    const achievement = ACHIEVEMENT_TYPES.find((a) => a.id === achievementId);
    if (!achievement) throw new Error("Achievement not found");

    earned.push(achievementId);
    saveEarned(wallet, earned);

    return {
      xpReward: achievement.xpReward,
      txSignature: `stub-achievement-${Date.now()}`,
    };
  }

  async checkEligible(_wallet: string): Promise<string[]> {
    // In real implementation, check on-chain state
    return [];
  }
}
