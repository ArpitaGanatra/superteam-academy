import { NextResponse } from "next/server";

/**
 * GET/POST /api/streaks
 *
 * Streak data is primarily stored in localStorage (frontend-only).
 * This endpoint serves as a persistence layer for authenticated users.
 *
 * Streaks are not tracked on-chain per the competition spec.
 */
export async function GET() {
  // Stub: streaks are managed client-side in localStorage
  return NextResponse.json({
    message: "Streak data is managed client-side. Use the StreakService.",
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Streak data is managed client-side. Use the StreakService.",
  });
}
