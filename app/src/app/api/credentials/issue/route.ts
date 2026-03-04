import { NextResponse } from "next/server";

/**
 * POST /api/credentials/issue
 *
 * Stub endpoint for credential issuance.
 * In production: signs issue_credential CPI to Metaplex Core.
 *
 * On-chain flow:
 * 1. Verify enrollment is finalized
 * 2. Generate new keypair for credential asset
 * 3. Build issue_credential instruction
 * 4. Metaplex Core createV2 with PermanentFreezeDelegate + Attributes
 * 5. Store credential_asset pubkey in enrollment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, wallet, trackId } = body;

    if (!courseId || !wallet || !trackId) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, wallet, trackId" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      mintAddress: `stub-cred-${Date.now()}`,
      txSignature: `stub-issue-${Date.now()}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
