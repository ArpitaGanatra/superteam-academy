# Customization Guide

## Theming

The app uses Tailwind CSS 4 with CSS custom properties for theming. Colors are defined in `src/app/globals.css`.

### Modifying Colors

Edit the CSS variables in `globals.css`:

```css
:root {
  --primary: oklch(0.7 0.15 160);     /* Main accent */
  --background: oklch(0.98 0 0);       /* Page background */
  --foreground: oklch(0.15 0 0);       /* Text color */
  --card: oklch(0.95 0 0);             /* Card background */
  --muted: oklch(0.9 0 0);             /* Muted elements */
}

.dark {
  --primary: oklch(0.7 0.15 160);
  --background: oklch(0.05 0 0);
  --foreground: oklch(0.95 0 0);
}
```

### Course Accent Colors

Each course has an `accent` property (hex color) used for its icon, progress bars, and CTAs. These are defined in `src/data/courses.ts`.

## Internationalization (i18n)

### Adding a New Language

1. Create the translation file: `src/i18n/<locale>.json`
2. Register it in `src/i18n/config.ts`:

```typescript
export const locales = ["en", "pt-BR", "es", "fr"] as const;
export const localeNames: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
  es: "Español",
  fr: "Français",
};
```

3. Import and register in `src/providers/locale-provider.tsx`:

```typescript
import fr from "@/i18n/fr.json";
const messages: Record<Locale, Record<string, unknown>> = {
  en, "pt-BR": ptBR, es, fr,
};
```

### Translation Keys

All translation keys are organized by page/feature:
- `common.*` — Shared UI labels
- `nav.*` — Navigation items
- `landing.*` — Landing page
- `courses.*` — Course catalog and detail
- `lesson.*` — Lesson interface
- `dashboard.*` — Dashboard
- `leaderboard.*` — Leaderboard
- `profile.*` — Profile page
- `settings.*` — Settings page
- `certificates.*` — Certificate viewer
- `footer.*` — Footer links

### Using Translations

```tsx
import { useLocale } from "@/providers/locale-provider";

function MyComponent() {
  const { t, locale, setLocale } = useLocale();

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.welcomeBack", { name: "Alex" })}</p>
    </div>
  );
}
```

## Adding Courses

### Mock Data (Development)

Edit `src/data/courses.ts` to add new courses:

```typescript
{
  slug: "my-new-course",
  title: "My New Course",
  difficulty: "Beginner",
  duration: "2h",
  xp: 500,
  accent: "#10b981",
  modules: [
    {
      id: "m1",
      title: "Module 1",
      lessons: [
        { id: "l1", title: "Lesson 1", type: "reading", duration: "5 min" },
        { id: "l2", title: "Challenge 1", type: "challenge", duration: "15 min" },
      ],
    },
  ],
}
```

### CMS (Production)

See [CMS_GUIDE.md](CMS_GUIDE.md) for adding courses through Sanity.

## Wallet Configuration

### Supported Wallets

Edit `src/providers/wallet-provider.tsx` to add/remove wallets:

```typescript
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

const wallets = useMemo(() => [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  // Add more wallet adapters here
], []);
```

### Network Configuration

Set `NEXT_PUBLIC_SOLANA_RPC_URL` in `.env.local`:

```env
# Devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Mainnet (Helius recommended)
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Analytics Setup

### Google Analytics 4

```env
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### PostHog

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Sentry

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Static Export

```bash
# next.config.ts
output: 'export'

npm run build
# Deploy the `out/` directory
```
