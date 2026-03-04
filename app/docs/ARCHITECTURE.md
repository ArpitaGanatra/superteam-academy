# Architecture Guide

## System Overview

Superteam Academy is a decentralized learning platform built on Solana. The frontend is a Next.js application that communicates with on-chain programs via the Solana Wallet Adapter and Anchor framework.

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  Next.js 16 · React 19 · Tailwind CSS 4         │
│                                                  │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Wallet  │  │  Service  │  │   Providers   │  │
│  │ Adapter │  │  Layer    │  │ Auth/i18n/etc │  │
│  └────┬────┘  └─────┬────┘  └───────────────┘  │
│       │             │                            │
│       ▼             ▼                            │
│  ┌──────────────────────────────┐               │
│  │      API Routes (7)          │               │
│  │  Backend-signed transactions │               │
│  └──────────┬───────────────────┘               │
└─────────────┼───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│              Solana Blockchain                   │
│                                                  │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Academy    │  │  Token-2022  │  │ Metaplex │ │
│  │ Program    │  │  (XP Mint)   │  │ Core     │ │
│  └────────────┘  └─────────────┘  └──────────┘ │
│                                                  │
│  Program: ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf │
│  XP Mint: xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3 │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Enrollment Flow
1. User connects wallet (Phantom/Solflare/Coinbase)
2. AuthProvider creates user profile in localStorage
3. User clicks "Enroll" on course detail page
4. ProgressService creates enrollment record
5. Analytics event fired (`courseEnrolled`)
6. **On-chain swap**: `enroll` instruction creates Enrollment PDA

### Lesson Completion Flow
1. User writes code in Monaco Editor
2. Auto-save to localStorage (1s debounce)
3. User clicks "Run Tests" — tests execute client-side
4. On pass, "Mark Complete" calls:
   - `progressService.completeLesson()`
   - `streakService.recordActivity()`
   - `activityService.recordActivity()`
   - `addXp(wallet, 25)`
   - Analytics event (`lessonCompleted`)
5. **On-chain swap**: POST `/api/lessons/complete` → backend signs `complete_lesson` instruction

### Credential Issuance Flow
1. User completes all lessons in a course
2. `finalizeCourse` called with bonus XP
3. POST `/api/credentials/issue` → backend signs Metaplex Core mint
4. NFT appears on profile page
5. **On-chain swap**: `issue_credential` instruction mints soulbound NFT

## Account Structure (PDA Seeds)

| Account | Seeds | Description |
|---------|-------|-------------|
| Config | `["config"]` | Platform configuration |
| Course | `["course", slug]` | Course metadata |
| Enrollment | `["enrollment", course, learner]` | Learner enrollment |
| AchievementType | `["achievement_type", id]` | Achievement definition |
| AchievementReceipt | `["achievement_receipt", achievement_type, recipient]` | Claimed achievement |
| CredentialType | `["credential_type", course]` | Credential definition |

## XP System

- **Token Standard**: Token-2022 with NonTransferable + PermanentDelegate
- **Mint Authority**: Config PDA (program-controlled)
- **Level Formula**: `Level = floor(sqrt(xp / 100))`
- **XP Sources**: Lesson completion (25 XP), course completion bonus (500 XP), achievement rewards (varies)

## Service Layer Architecture

```
┌─────────────────────────────────────┐
│          Service Interfaces          │
│  (src/services/interfaces.ts)       │
├─────────────────────────────────────┤
│  ProgressService                     │
│  XpService                           │
│  StreakService                        │
│  CredentialService                   │
│  LeaderboardService                  │
│  AchievementService                  │
│  ActivityService                     │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────┐
│ Local    │ │ On-Chain  │
│ Storage  │ │ (Future)  │
│ Stubs    │ │           │
└──────────┘ └──────────┘
```

Each service implementation is swappable. The localStorage stubs document exactly which Anchor instructions and PDA seeds are needed for the on-chain version.

## Provider Stack

```tsx
<ThemeProvider>
  <WalletProvider>      // Solana Wallet Adapter
    <AuthProvider>       // User profile management
      <LocaleProvider>   // i18n (EN, PT-BR, ES)
        <AnalyticsProvider>  // GA4 + PostHog + Sentry
          {children}
        </AnalyticsProvider>
      </LocaleProvider>
    </AuthProvider>
  </WalletProvider>
</ThemeProvider>
```

## API Routes

All API routes are stub endpoints that return mock responses. In production, they would:
1. Verify the request signature
2. Build the appropriate Solana transaction
3. Sign with the backend signer keypair
4. Return the serialized transaction for client submission

### Security Model
- Backend signer stored in `Config.backend_signer`
- Rotatable via `update_config` instruction
- API routes validate wallet ownership before signing
- All transactions require user wallet co-signature

## Analytics Integration

| Service | Purpose | Events |
|---------|---------|--------|
| GA4 | Page views, user flows | Page views, custom events |
| PostHog | Heatmaps, session replay | All custom events |
| Sentry | Error monitoring | Unhandled exceptions |

Custom events: `walletConnected`, `courseEnrolled`, `lessonCompleted`, `courseCompleted`, `codeSubmitted`, `testsPassed`, `achievementEarned`, `languageChanged`, `themeChanged`, `credentialViewed`

## Internationalization

- 3 locales: English (`en`), Portuguese (`pt-BR`), Spanish (`es`)
- Custom provider with nested key lookup: `t("nav.courses")`
- Parameter interpolation: `t("dashboard.welcomeBack", { name })`
- Locale persisted to localStorage
- No URL-based routing (single-page locale switching)
