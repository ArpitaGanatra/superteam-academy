import { NextResponse } from "next/server";

/**
 * POST /api/achievements/claim
 *
 * Stub endpoint for achievement claiming.
 * In production: signs award_achievement instruction.
 *
 * On-chain flow:
 * 1. Verify achievement_type is active
 * 2. Check current_supply < max_supply
 * 3. Init AchievementReceipt PDA (collision = already awarded)
 * 4. Mint soulbound Metaplex Core NFT
 * 5. Mint achievement_type.xp_reward to recipient XP ATA
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, achievementId } = body;

    if (!wallet || !achievementId) {
      return NextResponse.json(
        { error: "Missing required fields: wallet, achievementId" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      xpReward: 50,
      txSignature: `stub-achievement-${Date.now()}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
