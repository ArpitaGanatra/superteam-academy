import { NextResponse } from "next/server";

/**
 * POST /api/credentials/upgrade
 *
 * Stub endpoint for credential upgrade.
 * In production: signs upgrade_credential CPI to update
 * Metaplex Core NFT attributes (courses_completed, total_xp, level).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, mintAddress, coursesCompleted, totalXp } = body;

    if (!wallet || !mintAddress) {
      return NextResponse.json(
        { error: "Missing required fields: wallet, mintAddress" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      txSignature: `stub-upgrade-${Date.now()}`,
      coursesCompleted,
      totalXp,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
