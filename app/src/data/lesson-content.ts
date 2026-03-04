export interface LessonContent {
  courseSlug: string;
  lessonId: string;
  title: string;
  type: "video" | "reading" | "challenge";
  markdown: string;
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  testCases?: { input: string; expected: string }[];
}

/* ── Sample lesson content for Solana Fundamentals ── */

const solanaFundamentalsLessons: LessonContent[] = [
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l1",
    title: "What Makes Solana Different",
    type: "video",
    markdown: `## What Makes Solana Different

Solana is a high-performance blockchain designed for speed and scalability. Unlike Ethereum's sequential execution model, Solana processes transactions **in parallel** using a runtime called **Sealevel**.

### Key Innovations

**Proof of History (PoH)**
A cryptographic clock that timestamps transactions before they enter consensus. This means validators don't need to agree on *when* something happened — they already know.

\`\`\`
hash(previous_hash + data + timestamp) → next_hash
\`\`\`

**Sealevel — Parallel Execution**
Transactions that don't touch the same accounts can execute simultaneously across GPU cores. This is why Solana transactions must declare their accounts upfront.

**Tower BFT**
An optimized PBFT consensus that uses PoH as a clock, reducing communication overhead between validators.

### Performance Numbers

| Metric | Solana | Ethereum |
|--------|--------|----------|
| Block time | ~400ms | ~12s |
| TPS (theoretical) | 65,000 | ~15 |
| Finality | ~5s | ~15 min |
| Tx cost | ~$0.00025 | $1-50+ |

### Why This Matters for Developers

As a Solana developer, you need to think differently:
- **Accounts are the data model** — everything is an account
- **Programs are stateless** — they read/write to accounts
- **Transactions declare accounts** — enabling parallel execution
- **Compute is budgeted** — each transaction gets a compute unit limit

> In the next lesson, we'll dive deep into Solana's account model — the foundation of everything you build.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l2",
    title: "Accounts & the Account Model",
    type: "reading",
    markdown: `## Accounts & the Account Model

On Solana, **everything is an account**. Programs, tokens, NFTs, user data — all stored in accounts. Understanding the account model is the single most important concept for Solana development.

### Account Structure

Every account has these fields:

\`\`\`rust
pub struct Account {
    pub lamports: u64,        // Balance in lamports (1 SOL = 1B lamports)
    pub data: Vec<u8>,        // Arbitrary data stored by the account
    pub owner: Pubkey,        // Program that owns this account
    pub executable: bool,     // Is this account a program?
    pub rent_epoch: u64,      // Next epoch rent is due
}
\`\`\`

### Key Rules

1. **Only the owner can modify data** — a program can only write to accounts it owns
2. **Anyone can credit lamports** — you can send SOL to any account
3. **Only the owner can debit lamports** — only the owning program can deduct SOL
4. **Data can only be changed by the owner** — the System Program owns new accounts by default

### Account Types

| Type | Owner | Purpose |
|------|-------|---------|
| System Account | System Program | Wallets, SOL balances |
| Program Account | BPF Loader | Executable program code |
| Data Account | Your Program | State storage for programs |
| Token Account | Token Program | SPL token balances |

### Creating Accounts

Accounts must be created explicitly and funded with rent:

\`\`\`typescript
const createAccountIx = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: newAccount.publicKey,
  lamports: await connection.getMinimumBalanceForRentExemption(dataSize),
  space: dataSize,
  programId: ownerProgram,
});
\`\`\`

### Rent

Accounts must maintain a minimum SOL balance to remain on-chain. If an account's balance drops below this threshold, the runtime can garbage-collect it.

The formula: **~0.00089 SOL per byte per year**, but most accounts are made **rent-exempt** by depositing 2 years of rent upfront.

> **Practice:** Calculate the rent for a 100-byte account. You'll need \`connection.getMinimumBalanceForRentExemption(100)\`.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l3",
    title: "Rent & Account Lifecycle",
    type: "reading",
    markdown: `## Rent & Account Lifecycle

Every account on Solana must pay for the space it occupies. This mechanism prevents state bloat and keeps the network lean.

### Rent Exemption

Rather than paying rent every epoch, accounts can deposit enough SOL to become **rent-exempt**. This is the standard practice:

\`\`\`typescript
const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
  accountDataSize  // in bytes
);
\`\`\`

The minimum balance is approximately **6.96 SOL per MB**, or about **0.00089 SOL per byte per year** (x2 for rent exemption).

### Account Lifecycle

\`\`\`
Create → Fund (rent-exempt) → Use → Close (reclaim SOL)
\`\`\`

1. **Create**: Allocate space with \`SystemProgram.createAccount\`
2. **Fund**: Must deposit at least the rent-exempt minimum
3. **Use**: Owner program reads/writes data
4. **Close**: Transfer lamports out, zero the data → runtime garbage collects

### Closing Accounts

When you're done with an account, close it to reclaim the SOL:

\`\`\`rust
// In Anchor
#[account(
    mut,
    close = recipient,  // lamports go here
)]
pub data_account: Account<'info, MyData>,
\`\`\`

### Common Pitfall: Revival Attack

If you close an account but don't zero its data, someone could "revive" it by sending lamports back. Always zero data AND transfer all lamports when closing.

> **Key takeaway:** Always make accounts rent-exempt. Always zero data when closing accounts.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l4",
    title: "Quiz: Account Basics",
    type: "challenge",
    markdown: `## Challenge: Account Basics

Test your understanding of Solana's account model. Complete the function that creates a new data account for storing a counter value.

### Requirements

1. Create a new account owned by the program
2. Make it rent-exempt
3. Allocate exactly 8 bytes of space (for a u64 counter)
4. Return the transaction signature

### Hints

- Use \`SystemProgram.createAccount\` to create the account
- The space should be 8 bytes for a u64
- Don't forget to make the payer a signer
`,
    starterCode: `import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(
  connection: Connection,
  payer: Keypair
): Promise<string> {
  const counterAccount = Keypair.generate();

  // TODO: Calculate rent-exempt balance for 8 bytes


  // TODO: Create the transaction with createAccount instruction


  // TODO: Send and confirm the transaction


  // Return the transaction signature
}`,
    solutionCode: `import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(
  connection: Connection,
  payer: Keypair
): Promise<string> {
  const counterAccount = Keypair.generate();

  // Calculate rent-exempt balance for 8 bytes
  const lamports = await connection.getMinimumBalanceForRentExemption(8);

  // Create the transaction with createAccount instruction
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: counterAccount.publicKey,
      lamports,
      space: 8,
      programId: PROGRAM_ID,
    })
  );

  // Send and confirm the transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [payer, counterAccount]
  );

  return signature;
}`,
    hints: [
      "Use `connection.getMinimumBalanceForRentExemption(8)` to get the required lamports.",
      "The `createAccount` instruction needs: fromPubkey, newAccountPubkey, lamports, space, and programId.",
      "Both the payer and the new account need to sign the transaction.",
    ],
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l5",
    title: "Anatomy of a Transaction",
    type: "video",
    markdown: `## Anatomy of a Transaction

Every interaction with Solana goes through a transaction. Let's break down exactly what a transaction contains and how it flows through the network.

### Transaction Structure

\`\`\`
Transaction
├── Message
│   ├── Header
│   │   ├── num_required_signatures
│   │   ├── num_readonly_signed
│   │   └── num_readonly_unsigned
│   ├── Account Keys []        ← all accounts used
│   ├── Recent Blockhash       ← prevents replay
│   └── Instructions []
│       ├── program_id_index   ← which program to call
│       ├── account_indexes [] ← which accounts to pass
│       └── data []            ← instruction payload
└── Signatures []              ← ed25519 signatures
\`\`\`

### Why Accounts Are Declared Upfront

This is the key to Solana's parallel execution. By knowing which accounts each transaction touches, the runtime can:

1. **Run non-overlapping transactions in parallel**
2. **Lock only the necessary accounts**
3. **Detect conflicts before execution**

\`\`\`
Tx A: [Account 1, Account 2]  ─┐
                                ├── Run in parallel ✓
Tx B: [Account 3, Account 4]  ─┘

Tx C: [Account 1, Account 5]  ─┐
                                ├── Must serialize ✗
Tx D: [Account 1, Account 6]  ─┘
\`\`\`

### Transaction Lifecycle

\`\`\`
Build → Sign → Send → Process → Confirm → Finalize
\`\`\`

1. **Build**: Create instructions, set accounts
2. **Sign**: All required signers sign the message
3. **Send**: Submit to an RPC node
4. **Process**: Leader validates and executes
5. **Confirm**: Block propagates to validators
6. **Finalize**: 31+ confirmations (~13 seconds)

### Size Limits

- Max transaction size: **1,232 bytes**
- Max accounts per transaction: **64** (with lookup tables: 256)
- Max instructions per transaction: no hard limit, but constrained by size and compute

> **Next up:** We'll build transactions from scratch and learn instruction encoding.
`,
  },
];

/* ── Anchor Development sample lessons ── */

const anchorLessons: LessonContent[] = [
  {
    courseSlug: "anchor-development",
    lessonId: "l1",
    title: "Why Anchor?",
    type: "video",
    markdown: `## Why Anchor?

Anchor is the dominant framework for Solana program development. It provides macros, account validation, serialization, and error handling out of the box.

### Raw Solana vs Anchor

**Without Anchor** (native):
\`\`\`rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    // Manual validation...
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Manual deserialization...
    let mut data = account.data.borrow_mut();
    let counter = u64::from_le_bytes(data[..8].try_into().unwrap());
    // ...
}
\`\`\`

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

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}
\`\`\`

### What Anchor Gives You

| Feature | Benefit |
|---------|---------|
| Account validation macros | No manual signer/owner checks |
| Borsh serialization | Automatic (de)serialization |
| IDL generation | Auto-generated TypeScript client |
| Error handling | Typed errors with error codes |
| Events | On-chain event logging |
| CPI helpers | Type-safe cross-program calls |

### When NOT to Use Anchor

- **Maximum CU optimization** — native programs can be more efficient
- **Non-standard account layouts** — custom serialization needed
- **Learning fundamentals** — understanding native helps you debug

> Anchor doesn't replace understanding Solana — it accelerates building on it.
`,
  },
  {
    courseSlug: "anchor-development",
    lessonId: "l4",
    title: "Hello World Program",
    type: "challenge",
    markdown: `## Challenge: Hello World Program

Build your first Anchor program. Create a simple counter that can be initialized and incremented.

### Requirements

1. Define a \`Counter\` account struct with a \`count: u64\` field
2. Implement \`initialize\` to create the counter with count = 0
3. Implement \`increment\` to add 1 to the counter
4. Use proper Anchor account validation

### Tips

- Use \`#[account(init, payer = user, space = 8 + 8)]\` for initialization
- The first 8 bytes are the account discriminator
- Use \`#[account(mut)]\` for the increment instruction
`,
    starterCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // TODO: Set the counter to 0
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        // TODO: Increment the counter by 1
        Ok(())
    }
}

// TODO: Define the Initialize accounts struct


// TODO: Define the Increment accounts struct


// TODO: Define the Counter account struct
`,
    solutionCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
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
pub struct Counter {
    pub count: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    Overflow,
}`,
    hints: [
      "The Initialize struct needs three accounts: counter (init), user (mut, Signer), and system_program.",
      "Use `#[account(init, payer = user, space = 8 + 8)]` — 8 bytes for discriminator + 8 for u64.",
      "For increment, use `checked_add(1)` to prevent overflow — never use `+= 1` in on-chain code.",
    ],
  },
];

/* ── All lesson content ── */

const allLessons: LessonContent[] = [
  ...solanaFundamentalsLessons,
  ...anchorLessons,
];

export function getLessonContent(
  courseSlug: string,
  lessonId: string,
): LessonContent | undefined {
  return allLessons.find(
    (l) => l.courseSlug === courseSlug && l.lessonId === lessonId,
  );
}

export function getCourseLessons(courseSlug: string): LessonContent[] {
  return allLessons.filter((l) => l.courseSlug === courseSlug);
}
