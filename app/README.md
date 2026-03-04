# Superteam Academy

A decentralized learning platform for Solana development. Learners enroll in courses, complete interactive coding challenges, earn soulbound XP tokens (Token-2022), collect Metaplex Core credential NFTs, and climb the leaderboard.

## Features

- **Wallet Authentication** — Phantom, Solflare, Coinbase wallet integration via Solana Wallet Adapter
- **Interactive Code Editor** — Monaco Editor with syntax highlighting, auto-save, and test execution
- **Soulbound XP Tokens** — Token-2022 with NonTransferable + PermanentDelegate extensions
- **On-Chain Credentials** — Metaplex Core NFTs with PermanentFreezeDelegate (soulbound)
- **Gamification** — Streaks, achievements (16 types), leaderboard with time filters
- **Internationalization** — English, Portuguese (PT-BR), Spanish
- **Analytics** — GA4 page views, PostHog heatmaps, Sentry error monitoring
- **CMS Integration** — Sanity CMS with GROQ queries for course content
- **Service Layer** — Clean interface abstraction with localStorage stubs swappable to on-chain

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, React 19) |
| Styling | Tailwind CSS 4, shadcn/ui |
| Wallet | @solana/wallet-adapter-react |
| Blockchain | @solana/web3.js, @coral-xyz/anchor |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Markdown | react-markdown + remark-gfm |
| CMS | Sanity (@sanity/client) |
| Analytics | GA4, PostHog, Sentry |
| i18n | Custom provider (3 locales) |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Sanity CMS (optional)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production

# Analytics (optional)
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_SENTRY_DSN=
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── courses/           # Course catalog + detail + lessons
│   ├── dashboard/         # User dashboard with stats
│   ├── leaderboard/       # XP leaderboard
│   ├── profile/           # User profile + credentials
│   ├── settings/          # Account settings
│   ├── certificates/      # NFT credential viewer
│   └── api/               # API routes (7 endpoints)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Header, Footer
│   └── course/           # Course-specific components
├── data/                  # Mock data (courses, leaderboard, etc.)
├── services/              # Service layer (interfaces + implementations)
│   ├── interfaces.ts     # Service contracts
│   ├── progress.service.ts
│   ├── xp.service.ts
│   ├── streak.service.ts
│   ├── credential.service.ts
│   ├── leaderboard.service.ts
│   ├── achievement.service.ts
│   └── activity.service.ts
├── providers/             # React context providers
│   ├── wallet-provider.tsx
│   ├── auth-provider.tsx
│   ├── locale-provider.tsx
│   └── analytics-provider.tsx
├── i18n/                  # Translations (en, pt-BR, es)
├── lib/                   # Utilities (analytics, CMS client)
└── types/                 # TypeScript type definitions
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lessons/complete` | POST | Mark lesson complete, award XP |
| `/api/courses/finalize` | POST | Finalize course, award bonus XP |
| `/api/credentials/issue` | POST | Issue credential NFT |
| `/api/credentials/upgrade` | POST | Upgrade credential level |
| `/api/achievements/claim` | POST | Claim achievement badge |
| `/api/leaderboard` | GET | Paginated leaderboard with cache |
| `/api/streaks` | GET/POST | Streak management |

## On-Chain Architecture

- **Program ID**: `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf`
- **XP Mint**: `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3`
- **XP Level Formula**: `Level = floor(sqrt(xp / 100))`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full system design.

## Service Layer

The service layer uses clean interfaces that can be swapped from localStorage stubs to on-chain implementations:

```typescript
// Current: localStorage
const progressService = new LocalProgressService();

// Future: on-chain via Anchor
const progressService = new OnChainProgressService(program, connection);
```

Each service file documents the PDA seeds and Anchor instructions needed for the on-chain swap.

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) — System design, account maps, data flows
- [CMS Guide](docs/CMS_GUIDE.md) — Sanity setup and content management
- [Customization Guide](docs/CUSTOMIZATION.md) — Theming, i18n, deployment

## License

MIT
