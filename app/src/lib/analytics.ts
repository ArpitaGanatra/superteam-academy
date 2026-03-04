/**
 * Analytics service — GA4 + PostHog + Sentry.
 *
 * GA4: Page views + custom events
 * PostHog: Session recordings + heatmaps
 * Sentry: Error monitoring
 *
 * All analytics are client-side only and respect user privacy.
 */

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/* ── GA4 ── */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initGA4(): void {
  if (!GA4_ID || typeof window === "undefined") return;

  // Load gtag script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
}

export function trackPageView(url: string): void {
  if (!GA4_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA4_ID, { page_path: url });
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

/* ── Custom Events ── */

export const events = {
  walletConnected: (wallet: string) =>
    trackEvent("wallet_connected", "auth", wallet),
  courseEnrolled: (courseId: string) =>
    trackEvent("course_enrolled", "engagement", courseId),
  lessonCompleted: (courseId: string, lessonIndex: number) =>
    trackEvent("lesson_completed", "engagement", courseId, lessonIndex),
  courseCompleted: (courseId: string) =>
    trackEvent("course_completed", "engagement", courseId),
  codeSubmitted: (courseId: string) =>
    trackEvent("code_submitted", "engagement", courseId),
  testsPassed: (courseId: string) =>
    trackEvent("tests_passed", "engagement", courseId),
  achievementEarned: (achievementId: string) =>
    trackEvent("achievement_earned", "gamification", achievementId),
  languageChanged: (locale: string) =>
    trackEvent("language_changed", "preferences", locale),
  themeChanged: (theme: string) =>
    trackEvent("theme_changed", "preferences", theme),
  credentialViewed: (mintAddress: string) =>
    trackEvent("credential_viewed", "engagement", mintAddress),
};

/* ── PostHog ── */

export function initPostHog(): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return;

  const script = document.createElement("script");
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${POSTHOG_KEY}', {api_host: 'https://us.i.posthog.com', person_profiles: 'identified_only'});
  `;
  document.head.appendChild(script);
}

/* ── Sentry ── */

export async function initSentry(): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === "undefined") return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch {
    // Sentry not available
  }
}
