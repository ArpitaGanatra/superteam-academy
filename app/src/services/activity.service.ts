import type { ActivityService } from "./interfaces";
import type { ActivityItem } from "@/types";

const STORAGE_KEY = "academy_activity";

function loadActivity(wallet: string): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[wallet] ?? [];
  } catch {
    return [];
  }
}

function saveActivity(wallet: string, items: ActivityItem[]): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  all[wallet] = items;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export class LocalActivityService implements ActivityService {
  async getActivity(
    wallet: string,
    limit: number = 20,
  ): Promise<ActivityItem[]> {
    const items = loadActivity(wallet);
    return items.slice(0, limit);
  }

  async recordActivity(
    wallet: string,
    item: Omit<ActivityItem, "id" | "timestamp">,
  ): Promise<void> {
    const items = loadActivity(wallet);
    items.unshift({
      ...item,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    // Keep max 100 items
    saveActivity(wallet, items.slice(0, 100));
  }
}
