import { NextResponse } from "next/server";

/**
 * POST /api/courses/finalize
 *
 * Stub endpoint for course finalization.
 * In production: validates all lessons complete,
 * signs finalize_course with backend_signer.
 *
 * On-chain flow:
 * 1. Fetch enrollment, verify popcount == lesson_count
 * 2. Build finalize_course instruction
 * 3. Mints completion bonus = floor((xp_per_lesson * lesson_count) / 2)
 * 4. If total_completions >= min_completions_for_reward, mints creator_reward_xp
 * 5. Sets enrollment.completed_at = now
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, wallet } = body;

    if (!courseId || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, wallet" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      bonusXp: 500,
      txSignature: `stub-finalize-${Date.now()}`,
      courseId,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
