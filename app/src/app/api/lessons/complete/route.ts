import { NextResponse } from "next/server";

/**
 * POST /api/lessons/complete
 *
 * Stub endpoint for lesson completion.
 * In production, this validates the learner's code/answer,
 * builds a complete_lesson instruction, signs it with the
 * backend_signer keypair, and submits the transaction.
 *
 * On-chain flow:
 * 1. Validate lesson answer (check test cases server-side)
 * 2. Derive PDAs: config, course, enrollment
 * 3. Build complete_lesson instruction with backend_signer
 * 4. Sign and send transaction
 * 5. Return { xpEarned, txSignature }
 *
 * Required accounts:
 * - config (read)
 * - course (read) — seeds: ["course", courseId]
 * - enrollment (write) — seeds: ["enrollment", courseId, learner]
 * - learner token account (write) — XP ATA
 * - xp_mint (read)
 * - backend_signer (signer)
 * - token_program (Token-2022)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, lessonIndex, wallet } = body;

    if (!courseId || lessonIndex === undefined || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, lessonIndex, wallet" },
        { status: 400 },
      );
    }

    // Stub: return success with mock XP
    // In production: validate code, build tx, sign with backend_signer
    const xpEarned = 25;
    const txSignature = `stub-${Date.now()}`;

    return NextResponse.json({
      success: true,
      xpEarned,
      txSignature,
      lessonIndex,
      courseId,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
