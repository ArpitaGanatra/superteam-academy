import type { CredentialService } from "./interfaces";
import type { Credential } from "@/types";

const STORAGE_KEY = "academy_credentials";

function loadCredentials(): Record<string, Credential[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCredentials(data: Record<string, Credential[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Stub credential service using localStorage.
 *
 * On-chain swap:
 * - getCredentials → Helius DAS getAssetsByOwner filtered by track collection
 * - issueCredential → POST /api/credentials/issue → backend signs issue_credential CPI
 * - upgradeCredential → POST /api/credentials/upgrade → backend signs upgrade_credential CPI
 *
 * Metaplex Core NFT attributes: track_id, level, courses_completed, total_xp
 * Soulbound via PermanentFreezeDelegate plugin.
 */
export class LocalCredentialService implements CredentialService {
  async getCredentials(wallet: string): Promise<Credential[]> {
    const all = loadCredentials();
    return all[wallet] ?? [];
  }

  async getCredentialByMint(mintAddress: string): Promise<Credential | null> {
    const all = loadCredentials();
    for (const creds of Object.values(all)) {
      const found = creds.find((c) => c.mintAddress === mintAddress);
      if (found) return found;
    }
    return null;
  }

  async issueCredential(
    wallet: string,
    courseId: string,
    trackId: string,
  ): Promise<{ mintAddress: string; txSignature: string | null }> {
    const all = loadCredentials();
    if (!all[wallet]) all[wallet] = [];

    // Check if credential already exists for this track
    const existing = all[wallet].find((c) => c.track === trackId);
    if (existing) {
      return { mintAddress: existing.mintAddress, txSignature: null };
    }

    const mintAddress = `stub-${trackId}-${Date.now()}`;
    const credential: Credential = {
      id: `cred-${Date.now()}`,
      track: trackId,
      level: "Beginner",
      accent: "#34d399",
      mintAddress,
      earnedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      coursesCompleted: 1,
      totalXp: 0,
    };

    all[wallet].push(credential);
    saveCredentials(all);

    return { mintAddress, txSignature: `stub-issue-${Date.now()}` };
  }

  async upgradeCredential(
    wallet: string,
    mintAddress: string,
    coursesCompleted: number,
    totalXp: number,
  ): Promise<{ txSignature: string | null }> {
    const all = loadCredentials();
    const creds = all[wallet] ?? [];
    const cred = creds.find((c) => c.mintAddress === mintAddress);

    if (cred) {
      cred.coursesCompleted = coursesCompleted;
      cred.totalXp = totalXp;
      saveCredentials(all);
    }

    return { txSignature: `stub-upgrade-${Date.now()}` };
  }
}
