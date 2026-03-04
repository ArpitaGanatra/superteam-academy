import { NextResponse } from "next/server";
import { getLeaderboard } from "@/data/leaderboard";
import type { TimeFilter } from "@/types";

/**
 * GET /api/leaderboard?timeframe=weekly&page=1&pageSize=10
 *
 * Returns leaderboard entries.
 * Currently uses mock data.
 *
 * On-chain swap:
 * - Call Helius DAS getTokenAccounts for XP mint
 * - Sort by balance descending
 * - Enrich with user profiles from DB
 * - Cache with 5 min TTL
 *
 * Helius DAS call:
 *   POST https://devnet.helius-rpc.com/?api-key=KEY
 *   {
 *     jsonrpc: "2.0",
 *     method: "getTokenAccounts",
 *     params: { mint: "xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3", page: 1, limit: 100 }
 *   }
 */

let cache: {
  data: ReturnType<typeof getLeaderboard>;
  timestamp: number;
} | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = (searchParams.get("timeframe") || "all-time") as TimeFilter;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Use cached data if fresh
  const cacheKey = timeframe;
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    const entries = cache.data;
    const total = entries.length;
    const start = (page - 1) * pageSize;
    return NextResponse.json({
      entries: entries.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    });
  }

  // Fetch fresh data
  const entries = getLeaderboard(timeframe);
  cache = { data: entries, timestamp: Date.now() };

  const total = entries.length;
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    entries: entries.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  });
}
