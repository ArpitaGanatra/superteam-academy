/**
 * Seed Sanity CMS with course data from the hardcoded data files.
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   2. Set SANITY_WRITE_TOKEN in .env.local (Editor role token from sanity.io/manage)
 *   3. Run: node scripts/seed-sanity.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.error("Could not read .env.local — make sure it exists");
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-03-04",
  useCdn: false,
});

// ── Icon name mapping (LucideIcon component name → string) ──

const iconForSlug = {
  "solana-fundamentals": "Blocks",
  "wallets-and-transactions": "Wallet",
  "token-program-basics": "Coins",
  "anchor-development": "Anchor",
  "testing-with-bankrun": "TestTube",
  "program-security": "Shield",
  "amm-design": "ArrowLeftRight",
  "lending-protocols": "Landmark",
  "solana-mock-test": "Blocks",
  "cross-program-invocations": "GitBranch",
};

// ── Lesson content (EN only — matches lesson-content.ts) ──

const lessonContentMap = {
  "solana-fundamentals:l1": {
    markdown: `## What Makes Solana Different

Solana is a high-performance blockchain designed for speed and scalability. Unlike Ethereum's sequential execution model, Solana processes transactions **in parallel** using a runtime called **Sealevel**.

### Key Innovations

**Proof of History (PoH)**
A cryptographic clock that timestamps transactions before they enter consensus.

**Sealevel — Parallel Execution**
Transactions that don't touch the same accounts can execute simultaneously across GPU cores.

**Tower BFT**
An optimized PBFT consensus that uses PoH as a clock, reducing communication overhead.

### Performance Numbers

| Metric | Solana | Ethereum |
|--------|--------|----------|
| Block time | ~400ms | ~12s |
| TPS (theoretical) | 65,000 | ~15 |
| Finality | ~5s | ~15 min |
| Tx cost | ~$0.00025 | $1-50+ |

> In the next lesson, we'll dive deep into Solana's account model.`,
  },
  "solana-fundamentals:l2": {
    markdown: `## Accounts & the Account Model

On Solana, **everything is an account**. Programs, tokens, NFTs, user data — all stored in accounts.

### Account Structure

\`\`\`rust
pub struct Account {
    pub lamports: u64,
    pub data: Vec<u8>,
    pub owner: Pubkey,
    pub executable: bool,
    pub rent_epoch: u64,
}
\`\`\`

### Key Rules

1. **Only the owner can modify data**
2. **Anyone can credit lamports**
3. **Only the owner can debit lamports**
4. **Data can only be changed by the owner**

| Type | Owner | Purpose |
|------|-------|---------|
| System Account | System Program | Wallets, SOL balances |
| Program Account | BPF Loader | Executable program code |
| Data Account | Your Program | State storage |
| Token Account | Token Program | SPL token balances |`,
  },
  "solana-fundamentals:l3": {
    markdown: `## Rent & Account Lifecycle

Every account on Solana must pay for the space it occupies.

### Rent Exemption

\`\`\`typescript
const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(accountDataSize);
\`\`\`

### Account Lifecycle

\`\`\`
Create → Fund (rent-exempt) → Use → Close (reclaim SOL)
\`\`\`

### Closing Accounts

\`\`\`rust
#[account(mut, close = recipient)]
pub data_account: Account<'info, MyData>,
\`\`\`

> Always make accounts rent-exempt. Always zero data when closing.`,
  },
  "solana-fundamentals:l4": {
    markdown: `## Challenge: Account Basics

Create a new data account for storing a counter value.

### Requirements
1. Create a new account owned by the program
2. Make it rent-exempt
3. Allocate exactly 8 bytes of space (for a u64 counter)
4. Return the transaction signature`,
    starterCode: `import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(connection: Connection, payer: Keypair): Promise<string> {
  const counterAccount = Keypair.generate();
  // TODO: Calculate rent-exempt balance for 8 bytes
  // TODO: Create the transaction with createAccount instruction
  // TODO: Send and confirm the transaction
}`,
    solutionCode: `import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(connection: Connection, payer: Keypair): Promise<string> {
  const counterAccount = Keypair.generate();
  const lamports = await connection.getMinimumBalanceForRentExemption(8);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: counterAccount.publicKey,
      lamports, space: 8, programId: PROGRAM_ID,
    })
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [payer, counterAccount]);
  return signature;
}`,
    hints: [
      "Use `connection.getMinimumBalanceForRentExemption(8)` to get the required lamports.",
      "The `createAccount` instruction needs: fromPubkey, newAccountPubkey, lamports, space, and programId.",
      "Both the payer and the new account need to sign the transaction.",
    ],
    testCases: [
      { name: "Creates account with correct space", input: "space = 8", expected: "Account created with 8 bytes" },
      { name: "Account is rent-exempt", input: "lamports >= minimum", expected: "Balance meets threshold" },
      { name: "Correct program owner", input: "programId = PROGRAM_ID", expected: "Account owned by program" },
      { name: "Both signers included", input: "signers = [payer, account]", expected: "Transaction signed by both" },
    ],
  },
  "solana-fundamentals:l5": {
    markdown: `## Anatomy of a Transaction

Every interaction with Solana goes through a transaction.

### Transaction Structure

\`\`\`
Transaction
├── Message
│   ├── Header (num signatures, readonly counts)
│   ├── Account Keys []
│   ├── Recent Blockhash
│   └── Instructions []
│       ├── program_id_index
│       ├── account_indexes []
│       └── data []
└── Signatures []
\`\`\`

### Why Accounts Are Declared Upfront

By knowing which accounts each transaction touches, the runtime can run non-overlapping transactions in parallel.

### Transaction Lifecycle

\`\`\`
Build → Sign → Send → Process → Confirm → Finalize
\`\`\`

### Size Limits
- Max transaction size: **1,232 bytes**
- Max accounts per transaction: **64** (256 with lookup tables)`,
  },
  "anchor-development:l1": {
    markdown: `## Why Anchor?

Anchor is the dominant framework for Solana program development.

### Raw Solana vs Anchor

**With Anchor**:
\`\`\`rust
#[program]
pub mod counter {
    use super::*;
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }
}
\`\`\`

| Feature | Benefit |
|---------|---------|
| Account validation macros | No manual checks |
| Borsh serialization | Automatic |
| IDL generation | TypeScript client |
| Error handling | Typed errors |
| Events | On-chain logging |
| CPI helpers | Type-safe calls |`,
  },
  "anchor-development:l4": {
    markdown: `## Challenge: Hello World Program

Build your first Anchor program — a simple counter.

### Requirements
1. Define a Counter account struct with count: u64
2. Implement initialize (count = 0)
3. Implement increment (count += 1)
4. Use proper Anchor account validation`,
    starterCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // TODO: Set counter to 0
        Ok(())
    }
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        // TODO: Increment counter by 1
        Ok(())
    }
}

// TODO: Define Initialize, Increment accounts structs
// TODO: Define Counter account struct`,
    solutionCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter { pub count: u64 }

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    Overflow,
}`,
    hints: [
      "Use #[account(init, payer = user, space = 8 + 8)] — 8 discriminator + 8 u64.",
      "For increment, use checked_add(1) to prevent overflow.",
    ],
    testCases: [
      { name: "Counter struct defined", input: "#[account]", expected: "Has count: u64" },
      { name: "Initialize sets 0", input: "initialize(ctx)", expected: "count == 0" },
      { name: "Increment adds 1", input: "increment(ctx)", expected: "count == 1" },
      { name: "Uses checked arithmetic", input: "checked_add", expected: "Prevents overflow" },
    ],
  },
};

// ── Course data (mirrors courses.ts) ──

const courses = [
  {
    slug: "solana-fundamentals",
    title: "Solana Fundamentals",
    description: "Accounts, transactions, PDAs, and the runtime model. The foundation for everything you build on Solana.",
    longDescription: "Master the core concepts that power the Solana blockchain. You'll learn how accounts work, how transactions are processed, how Program Derived Addresses enable deterministic account creation, and how the Solana runtime executes programs.",
    difficulty: "Beginner", topic: "Core", topicLabel: "CORE", duration: "4h", xp: 2400, accent: "#34d399",
    codePreview: ['let account = ctx.accounts.data;', 'account.authority = *ctx.accounts', '  .signer.key;', 'msg!("PDA initialized");'],
    instructor: "Lucas Silva",
    instructorRole: "Core Contributor",
    order: 1,
    modules: [
      { title: "The Solana Model", lessons: [
        { title: "What Makes Solana Different", duration: "8 min", type: "video" },
        { title: "Accounts & the Account Model", duration: "12 min", type: "reading" },
        { title: "Rent & Account Lifecycle", duration: "6 min", type: "reading" },
        { title: "Quiz: Account Basics", duration: "5 min", type: "challenge" },
      ]},
      { title: "Transactions & Instructions", lessons: [
        { title: "Anatomy of a Transaction", duration: "10 min", type: "video" },
        { title: "Instructions & Programs", duration: "8 min", type: "reading" },
        { title: "Signing & Fees", duration: "7 min", type: "reading" },
        { title: "Build Your First Transaction", duration: "15 min", type: "challenge" },
      ]},
      { title: "Program Derived Addresses", lessons: [
        { title: "What Are PDAs?", duration: "10 min", type: "video" },
        { title: "Deriving Addresses with Seeds", duration: "8 min", type: "reading" },
        { title: "PDA Signing & CPIs", duration: "12 min", type: "reading" },
        { title: "Challenge: PDA Counter", duration: "20 min", type: "challenge" },
      ]},
      { title: "The Runtime Model", lessons: [
        { title: "Parallel Execution & Sealevel", duration: "10 min", type: "video" },
        { title: "Compute Units & Budgets", duration: "8 min", type: "reading" },
        { title: "Syscalls & Sysvars", duration: "7 min", type: "reading" },
        { title: "Runtime Constraints Quiz", duration: "5 min", type: "challenge" },
      ]},
      { title: "Solana CLI & Tooling", lessons: [
        { title: "Setting Up Your Environment", duration: "10 min", type: "video" },
        { title: "Solana CLI Deep Dive", duration: "12 min", type: "reading" },
        { title: "Using Solana Explorer", duration: "6 min", type: "reading" },
        { title: "Deploy Your First Program", duration: "20 min", type: "challenge" },
      ]},
      { title: "Capstone Project", lessons: [
        { title: "Project Brief: Note Keeper", duration: "5 min", type: "reading" },
        { title: "Build the Program", duration: "30 min", type: "challenge" },
        { title: "Write Client Code", duration: "20 min", type: "challenge" },
        { title: "Submit & Earn Credential", duration: "5 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Rafael M.", rating: 5, text: "Best Solana intro I've found. The PDA section finally made everything click." },
      { name: "Ana P.", rating: 5, text: "Clear, concise, and the challenges are actually useful." },
      { name: "Diego L.", rating: 4, text: "Great foundation course. Would love even more hands-on exercises." },
    ],
  },
  {
    slug: "wallets-and-transactions", title: "Wallets & Transactions",
    description: "Key pairs, signing, transaction lifecycle, and fee mechanics.",
    longDescription: "Dive deep into the transaction layer of Solana. From key pair generation and wallet standards to the full transaction lifecycle.",
    difficulty: "Beginner", topic: "Core", topicLabel: "CORE", duration: "2h", xp: 1200, accent: "#34d399",
    codePreview: ["const tx = new Transaction();", "tx.add(transferInstruction);", "const sig = await sendAndConfirm", "  (connection, tx, [payer]);"],
    instructor: "Mariana Costa", instructorRole: "Developer Relations", order: 2,
    modules: [
      { title: "Keys & Wallets", lessons: [
        { title: "Public & Private Keys", duration: "8 min", type: "video" },
        { title: "Wallet Standards (Wallet Adapter)", duration: "10 min", type: "reading" },
        { title: "Generate a Keypair", duration: "10 min", type: "challenge" },
      ]},
      { title: "Transaction Lifecycle", lessons: [
        { title: "Building Transactions", duration: "10 min", type: "video" },
        { title: "Signing & Serialization", duration: "8 min", type: "reading" },
        { title: "Sending & Confirmation", duration: "8 min", type: "reading" },
        { title: "Build a Transfer Flow", duration: "15 min", type: "challenge" },
      ]},
      { title: "Fees & Optimization", lessons: [
        { title: "Fee Mechanics", duration: "8 min", type: "video" },
        { title: "Priority Fees & Compute", duration: "7 min", type: "reading" },
        { title: "Versioned Transactions", duration: "8 min", type: "reading" },
        { title: "Retry Strategies", duration: "6 min", type: "reading" },
        { title: "Final Quiz", duration: "5 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Carlos B.", rating: 5, text: "Finally understand how transactions actually work end to end." },
      { name: "Julia R.", rating: 4, text: "Good pace. The retry strategies section was especially helpful." },
    ],
  },
  {
    slug: "token-program-basics", title: "Token Program Basics",
    description: "SPL tokens, minting, associated token accounts, and Token-2022 extensions.",
    longDescription: "Learn everything about tokens on Solana — from SPL Token to Token-2022 extensions.",
    difficulty: "Beginner", topic: "Core", topicLabel: "CORE", duration: "3h", xp: 1600, accent: "#34d399",
    codePreview: ["let mint = &ctx.accounts.mint;", "let ata = get_associated_token", "  _address(&owner, &mint.key());", "mint_to(cpi_ctx, amount)?;"],
    instructor: "Lucas Silva", instructorRole: "Core Contributor", order: 3,
    modules: [
      { title: "Token Fundamentals", lessons: [
        { title: "How Tokens Work on Solana", duration: "10 min", type: "video" },
        { title: "Mints & Token Accounts", duration: "8 min", type: "reading" },
        { title: "Associated Token Accounts", duration: "8 min", type: "reading" },
        { title: "Create Your First Token", duration: "15 min", type: "challenge" },
      ]},
      { title: "Token Operations", lessons: [
        { title: "Minting & Burning", duration: "8 min", type: "video" },
        { title: "Transfers & Approvals", duration: "8 min", type: "reading" },
        { title: "Freeze & Thaw", duration: "6 min", type: "reading" },
        { title: "Token Operations Challenge", duration: "15 min", type: "challenge" },
      ]},
      { title: "Token-2022 Extensions", lessons: [
        { title: "Introduction to Token-2022", duration: "10 min", type: "video" },
        { title: "Transfer Fees", duration: "8 min", type: "reading" },
        { title: "Non-Transferable Tokens", duration: "8 min", type: "reading" },
        { title: "Interest-Bearing Tokens", duration: "7 min", type: "reading" },
        { title: "Permanent Delegate", duration: "6 min", type: "reading" },
        { title: "Metadata Extension", duration: "6 min", type: "reading" },
        { title: "Build a Token-2022 Mint", duration: "20 min", type: "challenge" },
        { title: "Final Assessment", duration: "10 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Pedro H.", rating: 5, text: "Token-2022 section is gold. Nowhere else explains extensions this well." },
      { name: "Fernanda S.", rating: 5, text: "Loved the hands-on approach. Actually built a token by the end!" },
    ],
  },
  {
    slug: "anchor-development", title: "Anchor Development",
    description: "Build and deploy programs with the Anchor framework.",
    longDescription: "Go from zero to deploying production programs with Anchor.",
    difficulty: "Intermediate", topic: "Framework", topicLabel: "FRAMEWORK", duration: "5h", xp: 1800, accent: "#eab308",
    codePreview: ["#[program]", "pub mod counter {", "  pub fn increment(ctx: Ctx)", "    -> Result<()> { .. }"],
    instructor: "Thiago Ramos", instructorRole: "Anchor Maintainer", order: 4,
    modules: [
      { title: "Anchor Basics", lessons: [
        { title: "Why Anchor?", duration: "8 min", type: "video" },
        { title: "Project Structure & Setup", duration: "10 min", type: "reading" },
        { title: "The #[program] Macro", duration: "10 min", type: "reading" },
        { title: "Hello World Program", duration: "15 min", type: "challenge" },
      ]},
      { title: "Accounts & Constraints", lessons: [
        { title: "Account Structs & Validation", duration: "12 min", type: "video" },
        { title: "Init, Mut, Signer, Seeds", duration: "10 min", type: "reading" },
        { title: "Has One, Close, Realloc", duration: "8 min", type: "reading" },
        { title: "Build a Counter Program", duration: "20 min", type: "challenge" },
      ]},
      { title: "Advanced Anchor", lessons: [
        { title: "Error Handling & Events", duration: "10 min", type: "video" },
        { title: "CPIs in Anchor", duration: "12 min", type: "reading" },
        { title: "IDL & Client Generation", duration: "8 min", type: "reading" },
        { title: "TypeScript Client Integration", duration: "10 min", type: "reading" },
        { title: "Full-Stack Anchor App", duration: "25 min", type: "challenge" },
      ]},
      { title: "Deployment & Testing", lessons: [
        { title: "Local Validator & Bankrun", duration: "10 min", type: "video" },
        { title: "Writing Anchor Tests", duration: "12 min", type: "reading" },
        { title: "Deploying to Devnet", duration: "8 min", type: "reading" },
        { title: "Upgrade Authority & Verification", duration: "8 min", type: "reading" },
        { title: "Capstone: Deploy & Verify", duration: "20 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Matheus G.", rating: 5, text: "Anchor finally makes sense. The constraint deep-dive was exactly what I needed." },
      { name: "Isabella F.", rating: 4, text: "Great course. Would love a section on Anchor 0.31 migration." },
      { name: "Ricardo N.", rating: 5, text: "Best Anchor course available." },
    ],
  },
  {
    slug: "testing-with-bankrun", title: "Testing with Bankrun",
    description: "Unit tests, integration tests, and fuzzing for Solana programs.",
    longDescription: "Learn how to thoroughly test Solana programs with Mollusk, LiteSVM, and Trident.",
    difficulty: "Intermediate", topic: "Framework", topicLabel: "FRAMEWORK", duration: "3h", xp: 1400, accent: "#eab308",
    codePreview: ['let mut ctx = ProgramTest::new(', '  "my_program",', '  program_id,', '  processor!(process));'],
    instructor: "Thiago Ramos", instructorRole: "Anchor Maintainer", order: 5,
    modules: [
      { title: "Testing Fundamentals", lessons: [
        { title: "Why Testing Matters on Solana", duration: "8 min", type: "video" },
        { title: "Testing Tools Overview", duration: "6 min", type: "reading" },
        { title: "Setting Up Test Infrastructure", duration: "10 min", type: "challenge" },
      ]},
      { title: "Unit Testing", lessons: [
        { title: "Mollusk for Fast Unit Tests", duration: "10 min", type: "video" },
        { title: "Testing Instructions Individually", duration: "12 min", type: "reading" },
        { title: "Mocking Accounts & Sysvars", duration: "8 min", type: "reading" },
        { title: "Write Unit Tests", duration: "15 min", type: "challenge" },
      ]},
      { title: "Integration & Fuzz Testing", lessons: [
        { title: "LiteSVM & Bankrun", duration: "10 min", type: "video" },
        { title: "End-to-End Test Flows", duration: "12 min", type: "reading" },
        { title: "Fuzz Testing with Trident", duration: "10 min", type: "reading" },
        { title: "Build a Full Test Suite", duration: "20 min", type: "challenge" },
      ]},
      { title: "CU Profiling & Optimization", lessons: [
        { title: "Measuring Compute Units", duration: "8 min", type: "video" },
        { title: "CU Optimization Patterns", duration: "10 min", type: "reading" },
        { title: "Profile & Optimize Challenge", duration: "15 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Andre K.", rating: 5, text: "Finally a proper testing course for Solana." },
      { name: "Laura M.", rating: 4, text: "Practical and well-structured." },
    ],
  },
  {
    slug: "program-security", title: "Program Security",
    description: "Common vulnerabilities, access control patterns, and audit techniques.",
    longDescription: "Learn to think like an auditor. Covers the most common Solana vulnerabilities and defensive patterns.",
    difficulty: "Intermediate", topic: "Security", topicLabel: "SECURITY", duration: "4h", xp: 2000, accent: "#f472b6",
    codePreview: ["require!(ctx.accounts.authority", "  .key() == config.admin,", "  ErrorCode::Unauthorized);", "// checked_add prevents overflow"],
    instructor: "Camila Duarte", instructorRole: "Security Researcher", order: 6,
    modules: [
      { title: "Security Mindset", lessons: [
        { title: "Why Security Matters", duration: "8 min", type: "video" },
        { title: "Solana's Trust Model", duration: "8 min", type: "reading" },
        { title: "Common Vulnerability Classes", duration: "10 min", type: "reading" },
        { title: "Spot the Bug Quiz", duration: "10 min", type: "challenge" },
      ]},
      { title: "Account Validation", lessons: [
        { title: "Missing Signer Checks", duration: "10 min", type: "video" },
        { title: "Owner & Type Validation", duration: "8 min", type: "reading" },
        { title: "PDA Verification Patterns", duration: "10 min", type: "reading" },
        { title: "Account Validation Challenge", duration: "15 min", type: "challenge" },
      ]},
      { title: "Arithmetic & State", lessons: [
        { title: "Integer Overflow & Underflow", duration: "8 min", type: "video" },
        { title: "Checked vs Unchecked Math", duration: "8 min", type: "reading" },
        { title: "Re-initialization Attacks", duration: "8 min", type: "reading" },
        { title: "State Manipulation Challenge", duration: "15 min", type: "challenge" },
      ]},
      { title: "Advanced Patterns", lessons: [
        { title: "CPI Security", duration: "10 min", type: "video" },
        { title: "Closing Accounts Safely", duration: "8 min", type: "reading" },
        { title: "Frontrunning & MEV", duration: "8 min", type: "reading" },
        { title: "Advanced Security Challenge", duration: "15 min", type: "challenge" },
      ]},
      { title: "Audit Practices", lessons: [
        { title: "Case Study: Past Exploits", duration: "12 min", type: "video" },
        { title: "Audit Checklist", duration: "8 min", type: "reading" },
        { title: "Self-Audit Your Program", duration: "20 min", type: "challenge" },
        { title: "Final Assessment", duration: "10 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Marcos V.", rating: 5, text: "Essential course. The exploit case studies really drive the lessons home." },
      { name: "Beatriz A.", rating: 5, text: "Every Solana dev should take this." },
      { name: "Gustavo T.", rating: 4, text: "Thorough and practical." },
    ],
  },
  {
    slug: "amm-design", title: "AMM Design",
    description: "Constant product AMMs, concentrated liquidity, and swap mechanics.",
    longDescription: "Build a decentralized exchange from scratch on Solana.",
    difficulty: "Advanced", topic: "DeFi", topicLabel: "DEFI", duration: "5h", xp: 1500, accent: "#22d3ee",
    codePreview: ["let pool = &ctx.accounts.pool;", "let price = pool.sqrt_price;", "swap_exact_in(pool, amount,", "  min_out)?;"],
    instructor: "Felipe Moura", instructorRole: "DeFi Engineer", order: 7,
    modules: [
      { title: "AMM Fundamentals", lessons: [
        { title: "What Are AMMs?", duration: "10 min", type: "video" },
        { title: "The Constant Product Formula", duration: "10 min", type: "reading" },
        { title: "Price Impact & Slippage", duration: "8 min", type: "reading" },
        { title: "AMM Math Quiz", duration: "10 min", type: "challenge" },
      ]},
      { title: "Building the Pool", lessons: [
        { title: "Pool Account Design", duration: "10 min", type: "video" },
        { title: "Initialize Pool Instruction", duration: "12 min", type: "reading" },
        { title: "Add Liquidity", duration: "12 min", type: "reading" },
        { title: "Build Pool Program", duration: "25 min", type: "challenge" },
      ]},
      { title: "Swap Mechanics", lessons: [
        { title: "Swap Implementation", duration: "12 min", type: "video" },
        { title: "Fee Structure", duration: "8 min", type: "reading" },
        { title: "Remove Liquidity", duration: "8 min", type: "reading" },
        { title: "Full Swap Challenge", duration: "25 min", type: "challenge" },
      ]},
      { title: "Advanced Topics", lessons: [
        { title: "Concentrated Liquidity Concepts", duration: "12 min", type: "video" },
        { title: "Oracle Integration", duration: "10 min", type: "reading" },
        { title: "Deploy Your AMM", duration: "20 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Henrique S.", rating: 5, text: "Actually built a working AMM." },
      { name: "Valentina R.", rating: 4, text: "Challenging but rewarding." },
    ],
  },
  {
    slug: "lending-protocols", title: "Lending Protocols",
    description: "Collateral management, interest rate models, and liquidation mechanics.",
    longDescription: "Understand how lending protocols work at the program level.",
    difficulty: "Advanced", topic: "DeFi", topicLabel: "DEFI", duration: "4h", xp: 1200, accent: "#22d3ee",
    codePreview: ["let health = collateral_value", "  .checked_div(debt_value)?;", "require!(health >= MIN_HEALTH,", "  ErrorCode::Undercollat);"],
    instructor: "Felipe Moura", instructorRole: "DeFi Engineer", order: 8,
    modules: [
      { title: "Lending Fundamentals", lessons: [
        { title: "How Lending Protocols Work", duration: "10 min", type: "video" },
        { title: "Collateral & Borrowing", duration: "8 min", type: "reading" },
        { title: "Interest Rate Models", duration: "10 min", type: "reading" },
      ]},
      { title: "Building the Protocol", lessons: [
        { title: "Vault Account Design", duration: "10 min", type: "video" },
        { title: "Deposit & Withdraw", duration: "12 min", type: "reading" },
        { title: "Borrow & Repay", duration: "12 min", type: "reading" },
        { title: "Build Lending Program", duration: "25 min", type: "challenge" },
      ]},
      { title: "Risk & Liquidation", lessons: [
        { title: "Health Factor Calculation", duration: "10 min", type: "video" },
        { title: "Liquidation Mechanics", duration: "10 min", type: "reading" },
        { title: "Oracle Price Feeds", duration: "8 min", type: "reading" },
        { title: "Implement Liquidation", duration: "20 min", type: "challenge" },
        { title: "Final Assessment", duration: "10 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Rodrigo F.", rating: 5, text: "Finally understand how Solend/Marginfi work." },
      { name: "Camila N.", rating: 5, text: "The liquidation section is worth the entire course." },
    ],
  },
  {
    slug: "solana-mock-test", title: "Solana Quick Start (Devnet Test)",
    description: "A short test course deployed on devnet for integration testing.",
    longDescription: "This course exists on-chain on Solana devnet for integration testing.",
    difficulty: "Beginner", topic: "Core", topicLabel: "CORE", duration: "30m", xp: 500, accent: "#34d399",
    codePreview: ["// On-chain enrollment test", 'let course = "solana-mock-test";', "let ix = enroll(course, learner);", "send_transaction(ix);"],
    instructor: "Test Instructor", instructorRole: "Devnet Testing", order: 9,
    modules: [
      { title: "Getting Started", lessons: [
        { title: "Introduction to Solana", duration: "5 min", type: "reading" },
        { title: "Setting Up Your Wallet", duration: "5 min", type: "reading" },
        { title: "Your First Transaction", duration: "10 min", type: "challenge" },
      ]},
      { title: "On-Chain Basics", lessons: [
        { title: "Understanding Accounts", duration: "5 min", type: "reading" },
        { title: "Final Quiz", duration: "5 min", type: "challenge" },
      ]},
    ],
    reviews: [{ name: "Test User", rating: 5, text: "Quick course to verify on-chain integration." }],
  },
  {
    slug: "cross-program-invocations", title: "Cross-Program Invocations",
    description: "CPIs, program-derived addresses, and composable program design.",
    longDescription: "Master composable Solana programs with CPIs, PDA signing, and cross-program account validation.",
    difficulty: "Advanced", topic: "DeFi", topicLabel: "DEFI", duration: "3h", xp: 1000, accent: "#22d3ee",
    codePreview: ["let cpi_ctx = CpiContext::new(", "  token_program.to_account_info(),", "  Transfer { from, to, auth },", ").with_signer(&[&seeds]);"],
    instructor: "Thiago Ramos", instructorRole: "Anchor Maintainer", order: 10,
    modules: [
      { title: "CPI Fundamentals", lessons: [
        { title: "What Are CPIs?", duration: "8 min", type: "video" },
        { title: "invoke vs invoke_signed", duration: "10 min", type: "reading" },
        { title: "PDA Signing in CPIs", duration: "10 min", type: "reading" },
      ]},
      { title: "Common CPI Patterns", lessons: [
        { title: "Token Transfers via CPI", duration: "10 min", type: "video" },
        { title: "Creating Accounts via CPI", duration: "10 min", type: "reading" },
        { title: "CPI to System Program", duration: "8 min", type: "reading" },
        { title: "Multi-CPI Challenge", duration: "20 min", type: "challenge" },
      ]},
      { title: "Composable Design", lessons: [
        { title: "Designing for Composability", duration: "10 min", type: "video" },
        { title: "Account Reloading After CPI", duration: "8 min", type: "reading" },
        { title: "Build a Composable Program", duration: "25 min", type: "challenge" },
      ]},
    ],
    reviews: [
      { name: "Bruno T.", rating: 5, text: "CPIs went from terrifying to intuitive." },
      { name: "Larissa D.", rating: 4, text: "Short but packed with value." },
    ],
  },
];

// ── Seed logic ──

// Track lesson index per course to generate stable _key values
let lessonCounter = 0;

async function seed() {
  console.log(`Seeding Sanity project: ${projectId} / ${dataset}\n`);

  // 1. Create unique instructors
  const instructorMap = new Map();
  for (const c of courses) {
    if (!instructorMap.has(c.instructor)) {
      instructorMap.set(c.instructor, {
        _id: `instructor-${c.instructor.toLowerCase().replace(/\s+/g, "-")}`,
        _type: "instructor",
        name: c.instructor,
        role: c.instructorRole,
      });
    }
  }

  const transaction = client.transaction();

  for (const doc of instructorMap.values()) {
    console.log(`  Instructor: ${doc.name}`);
    transaction.createOrReplace(doc);
  }

  // 2. Create courses with inline modules/lessons
  for (const c of courses) {
    lessonCounter = 0;
    const courseId = `course-${c.slug}`;
    const instructorId = `instructor-${c.instructor.toLowerCase().replace(/\s+/g, "-")}`;

    const modules = c.modules.map((m, mi) => {
      const moduleKey = `m${mi + 1}`;
      return {
        _key: moduleKey,
        _type: "module",
        title: m.title,
        lessons: m.lessons.map((l, li) => {
          lessonCounter++;
          const lessonKey = `l${lessonCounter}`;
          const contentKey = `${c.slug}:${lessonKey}`;
          const content = lessonContentMap[contentKey];

          return {
            _key: lessonKey,
            _type: "lesson",
            title: l.title,
            duration: l.duration,
            type: l.type,
            ...(content?.markdown && { markdown: content.markdown }),
            ...(content?.starterCode && { starterCode: content.starterCode }),
            ...(content?.solutionCode && { solutionCode: content.solutionCode }),
            ...(content?.hints && { hints: content.hints }),
            ...(content?.testCases && {
              testCases: content.testCases.map((tc, i) => ({
                _key: `tc${i}`,
                _type: "testCase",
                ...tc,
              })),
            }),
          };
        }),
      };
    });

    const doc = {
      _id: courseId,
      _type: "course",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      description: c.description,
      longDescription: c.longDescription,
      difficulty: c.difficulty,
      topic: c.topic,
      topicLabel: c.topicLabel,
      duration: c.duration,
      xp: c.xp,
      accent: c.accent,
      icon: iconForSlug[c.slug] || "Blocks",
      codePreview: c.codePreview,
      order: c.order,
      instructor: { _type: "reference", _ref: instructorId },
      modules,
      reviews: c.reviews.map((r, i) => ({
        _key: `r${i}`,
        _type: "object",
        name: r.name,
        rating: r.rating,
        text: r.text,
      })),
    };

    console.log(`  Course: ${c.title} (${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons)`);
    transaction.createOrReplace(doc);
  }

  console.log("\nCommitting...");
  const result = await transaction.commit();
  console.log(`Done! Created/updated ${result.results.length} documents.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
