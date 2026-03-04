"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Blocks,
  Anchor,
  Landmark,
  Shield,
  Wrench,
  BookOpen,
  Wallet,
  Coins,
  TestTube,
  Lock,
  ArrowLeftRight,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CourseCard, type Course } from "@/components/course/course-card";

/* ── Course data ── */

const courses: Course[] = [
  {
    slug: "solana-fundamentals",
    title: "Solana Fundamentals",
    description:
      "Accounts, transactions, PDAs, and the runtime model. The foundation for everything you build on Solana.",
    difficulty: "Beginner",
    topic: "Core",
    topicLabel: "CORE",
    duration: "4h",
    lessons: 24,
    completed: 0,
    xp: 2400,
    accent: "#34d399",
    icon: Blocks,
    codePreview: [
      "let account = ctx.accounts.data;",
      "account.authority = *ctx.accounts",
      "  .signer.key;",
      'msg!("PDA initialized");',
    ],
  },
  {
    slug: "wallets-and-transactions",
    title: "Wallets & Transactions",
    description:
      "Key pairs, signing, transaction lifecycle, and fee mechanics. Understand what happens under the hood.",
    difficulty: "Beginner",
    topic: "Core",
    topicLabel: "CORE",
    duration: "2h",
    lessons: 12,
    completed: 0,
    xp: 1200,
    accent: "#34d399",
    icon: Wallet,
    codePreview: [
      "const tx = new Transaction();",
      "tx.add(transferInstruction);",
      "const sig = await sendAndConfirm",
      "  (connection, tx, [payer]);",
    ],
  },
  {
    slug: "token-program-basics",
    title: "Token Program Basics",
    description:
      "SPL tokens, minting, associated token accounts, and Token-2022 extensions. Build your first token.",
    difficulty: "Beginner",
    topic: "Core",
    topicLabel: "CORE",
    duration: "3h",
    lessons: 16,
    completed: 0,
    xp: 1600,
    accent: "#34d399",
    icon: Coins,
    codePreview: [
      "let mint = &ctx.accounts.mint;",
      "let ata = get_associated_token",
      "  _address(&owner, &mint.key());",
      "mint_to(cpi_ctx, amount)?;",
    ],
  },
  {
    slug: "anchor-development",
    title: "Anchor Development",
    description:
      "Build and deploy programs with the Anchor framework. Macros, IDL generation, and account validation.",
    difficulty: "Intermediate",
    topic: "Framework",
    topicLabel: "FRAMEWORK",
    duration: "5h",
    lessons: 18,
    completed: 0,
    xp: 1800,
    accent: "#eab308",
    icon: Anchor,
    codePreview: [
      "#[program]",
      "pub mod counter {",
      "  pub fn increment(ctx: Ctx)",
      "    -> Result<()> { .. }",
    ],
  },
  {
    slug: "testing-with-bankrun",
    title: "Testing with Bankrun",
    description:
      "Unit tests, integration tests, and fuzzing for Solana programs. Mollusk, LiteSVM, and test patterns.",
    difficulty: "Intermediate",
    topic: "Framework",
    topicLabel: "FRAMEWORK",
    duration: "3h",
    lessons: 14,
    completed: 0,
    xp: 1400,
    accent: "#eab308",
    icon: TestTube,
    codePreview: [
      "let mut ctx = ProgramTest::new(",
      '  "my_program",',
      "  program_id,",
      "  processor!(process));",
    ],
  },
  {
    slug: "program-security",
    title: "Program Security",
    description:
      "Common vulnerabilities, access control patterns, and audit techniques. Secure your programs before mainnet.",
    difficulty: "Intermediate",
    topic: "Security",
    topicLabel: "SECURITY",
    duration: "4h",
    lessons: 20,
    completed: 0,
    xp: 2000,
    accent: "#f472b6",
    icon: Shield,
    codePreview: [
      "require!(ctx.accounts.authority",
      "  .key() == config.admin,",
      "  ErrorCode::Unauthorized);",
      "// checked_add prevents overflow",
    ],
  },
  {
    slug: "amm-design",
    title: "AMM Design",
    description:
      "Constant product AMMs, concentrated liquidity, and swap mechanics. Build a decentralized exchange.",
    difficulty: "Advanced",
    topic: "DeFi",
    topicLabel: "DEFI",
    duration: "5h",
    lessons: 15,
    completed: 0,
    xp: 1500,
    accent: "#22d3ee",
    icon: ArrowLeftRight,
    codePreview: [
      "let pool = &ctx.accounts.pool;",
      "let price = pool.sqrt_price;",
      "swap_exact_in(pool, amount,",
      "  min_out)?;",
    ],
  },
  {
    slug: "lending-protocols",
    title: "Lending Protocols",
    description:
      "Collateral management, interest rate models, and liquidation mechanics. Understand DeFi primitives.",
    difficulty: "Advanced",
    topic: "DeFi",
    topicLabel: "DEFI",
    duration: "4h",
    lessons: 12,
    completed: 0,
    xp: 1200,
    accent: "#22d3ee",
    icon: Landmark,
    codePreview: [
      "let health = collateral_value",
      "  .checked_div(debt_value)?;",
      "require!(health >= MIN_HEALTH,",
      "  ErrorCode::Undercollat);",
    ],
  },
  {
    slug: "cross-program-invocations",
    title: "Cross-Program Invocations",
    description:
      "CPIs, program-derived addresses, and composable program design. Connect programs together.",
    difficulty: "Advanced",
    topic: "DeFi",
    topicLabel: "DEFI",
    duration: "3h",
    lessons: 10,
    completed: 0,
    xp: 1000,
    accent: "#22d3ee",
    icon: GitBranch,
    codePreview: [
      "let cpi_ctx = CpiContext::new(",
      "  token_program.to_account_info(),",
      "  Transfer { from, to, auth },",
      ").with_signer(&[&seeds]);",
    ],
  },
];

/* ── Filter config ── */

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const topics = ["Core", "Framework", "Security", "DeFi"] as const;
const durations = ["< 3h", "3-4h", "5h+"] as const;

const paths = [
  {
    name: "Solana Fundamentals",
    topic: "Core",
    icon: Blocks,
    accent: "#34d399",
    count: 3,
  },
  {
    name: "Anchor Development",
    topic: "Framework",
    icon: Anchor,
    accent: "#eab308",
    count: 2,
  },
  {
    name: "DeFi Developer",
    topic: "DeFi",
    icon: Landmark,
    accent: "#22d3ee",
    count: 3,
  },
  {
    name: "Security Auditor",
    topic: "Security",
    icon: Shield,
    accent: "#f472b6",
    count: 1,
  },
];

function matchesDuration(
  courseDuration: string,
  filter: string
): boolean {
  const hours = parseInt(courseDuration);
  if (filter === "< 3h") return hours < 3;
  if (filter === "3-4h") return hours >= 3 && hours <= 4;
  if (filter === "5h+") return hours >= 5;
  return true;
}

export default function CourseCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const hasFilters = selectedDifficulty || selectedTopic || selectedDuration || search;

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
      if (selectedTopic && c.topic !== selectedTopic) return false;
      if (selectedDuration && !matchesDuration(c.duration, selectedDuration))
        return false;
      return true;
    });
  }, [search, selectedDifficulty, selectedTopic, selectedDuration]);

  function clearAll() {
    setSearch("");
    setSelectedDifficulty(null);
    setSelectedTopic(null);
    setSelectedDuration(null);
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-mesh animate-drift-2" />
      <div className="pointer-events-none absolute top-[20%] right-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[120px] animate-float-1" />
      <div className="pointer-events-none absolute bottom-[30%] left-[5%] h-56 w-56 rounded-full bg-amber-500/8 blur-[80px] animate-float-2" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Course Catalog
          </h1>
          <p className="mt-2 text-muted-foreground">
            Structured paths from zero to shipping on mainnet. Pick a track or
            explore individual courses.
          </p>
        </div>

        {/* Search */}
        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10 bg-card/80 backdrop-blur-sm border-border/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Difficulty
          </span>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === d ? null : d)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedDifficulty === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}

          <div className="mx-2 h-4 w-px bg-border/50" />

          <span className="text-xs font-medium text-muted-foreground mr-1">
            Topic
          </span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() =>
                setSelectedTopic(selectedTopic === t ? null : t)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedTopic === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}

          <div className="mx-2 h-4 w-px bg-border/50" />

          <span className="text-xs font-medium text-muted-foreground mr-1">
            Duration
          </span>
          {durations.map((dur) => (
            <button
              key={dur}
              onClick={() =>
                setSelectedDuration(selectedDuration === dur ? null : dur)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedDuration === dur
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {dur}
            </button>
          ))}

          {hasFilters && (
            <>
              <div className="mx-2 h-4 w-px bg-border/50" />
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {selectedDifficulty && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer"
                onClick={() => setSelectedDifficulty(null)}
              >
                {selectedDifficulty}
                <X className="size-3" />
              </Badge>
            )}
            {selectedTopic && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer"
                onClick={() => setSelectedTopic(null)}
              >
                {selectedTopic}
                <X className="size-3" />
              </Badge>
            )}
            {selectedDuration && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer"
                onClick={() => setSelectedDuration(null)}
              >
                {selectedDuration}
                <X className="size-3" />
              </Badge>
            )}
            {search && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer"
                onClick={() => setSearch("")}
              >
                &quot;{search}&quot;
                <X className="size-3" />
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {filtered.length} course{filtered.length !== 1 && "s"}
            </span>
          </div>
        )}

        {/* Learning Paths */}
        <div className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Learning Paths
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {paths.map((path) => (
              <button
                key={path.name}
                onClick={() =>
                  setSelectedTopic(
                    selectedTopic === path.topic ? null : path.topic
                  )
                }
                className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  selectedTopic === path.topic
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/50 bg-card/60 backdrop-blur-sm hover:border-border hover:bg-card/80"
                }`}
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${path.accent}40`,
                    color: path.accent,
                    background: `${path.accent}10`,
                  }}
                >
                  <path.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{path.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {path.count} courses
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="mt-10">
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="size-10 text-muted-foreground/30" />
              <p className="mt-4 text-lg font-medium">No courses found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearAll}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
