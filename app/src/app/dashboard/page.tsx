"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  FileText,
  Code,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useLocale } from "@/providers/locale-provider";
import {
  xpService,
  streakService,
  achievementService,
  activityService,
  progressService,
  leaderboardService,
} from "@/services";
import { getAllCourses } from "@/lib/sanity-fetch";
import { xpProgress } from "@/types";
import type {
  StreakData,
  Achievement,
  ActivityItem,
  CourseDetail,
  CourseProgress,
  DayStatus,
} from "@/types";

/* ── Helpers ── */

const activityDot: Record<string, string> = {
  lesson_complete: "bg-emerald-400",
  achievement: "bg-amber-400",
  course_start: "bg-blue-400",
  streak: "bg-orange-400",
};

function translateActivity(
  item: ActivityItem,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  let title = item.title;
  const itemLabel = item.itemName
    ? t(`activity.items.${item.itemName}`)
    : undefined;

  if (item.type === "lesson_complete" && itemLabel) {
    title = t("activity.completedLesson", { name: itemLabel });
  } else if (item.type === "achievement" && itemLabel) {
    title = t("activity.earnedBadge", { name: itemLabel });
  } else if (item.type === "course_start" && itemLabel) {
    title = t("activity.startedCourse", { name: itemLabel });
  } else if (item.type === "streak" && item.streakDays) {
    title = t("activity.learningStreak", { count: item.streakDays });
  }

  const courseName = item.courseSlug
    ? t(`courseContent.${item.courseSlug}.title`)
    : item.courseName;

  let timestamp = item.timestamp;
  if (item.timeKey) {
    timestamp =
      item.timeValue !== undefined
        ? t(`activity.${item.timeKey}`, { count: item.timeValue })
        : t(`activity.${item.timeKey}`);
  }

  return { title, courseName, timestamp };
}

function LessonIcon({ type }: { type: "video" | "reading" | "challenge" }) {
  if (type === "video") return <Play className="size-3" />;
  if (type === "challenge") return <Code className="size-3" />;
  return <FileText className="size-3" />;
}

function getMonthNames(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "long" }).format(
      new Date(2024, i),
    ),
  );
}

function getDayHeaders(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(new Date(2024, 0, i + 1))
      .slice(0, 2),
  );
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  let dow = first.getDay();
  dow = dow === 0 ? 6 : dow - 1;

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array.from<null>({ length: dow }).fill(null);

  for (let d = 1; d <= days; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

/** Convert streak history "YYYY-MM-DD" → grouped by "YYYY-MM" */
function historyToMonthly(
  history: Record<string, DayStatus>,
): Record<string, Record<number, DayStatus>> {
  const result: Record<string, Record<number, DayStatus>> = {};
  for (const [dateStr, status] of Object.entries(history)) {
    const month = dateStr.slice(0, 7);
    const day = parseInt(dateStr.slice(8));
    if (!result[month]) result[month] = {};
    result[month][day] = status;
  }
  return result;
}

function StreakCalendar({
  monthlyActivity,
}: {
  monthlyActivity: Record<string, Record<number, DayStatus>>;
}) {
  const { locale } = useLocale();
  const MONTH_NAMES = getMonthNames(locale);
  const DAY_HEADERS = getDayHeaders(locale);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const weeks = getMonthGrid(calYear, calMonth);
  const isCurrentMonth =
    calYear === now.getFullYear() && calMonth === now.getMonth();
  const todayDate = isCurrentMonth ? now.getDate() : -1;

  const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const monthData = monthlyActivity[key] ?? {};

  const prev = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };
  const next = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const canGoNext =
    calYear < now.getFullYear() ||
    (calYear === now.getFullYear() && calMonth < now.getMonth());

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] text-muted-foreground/60">
            {calYear}
          </span>
          <p className="text-sm font-semibold leading-tight">
            {MONTH_NAMES[calMonth]}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={prev}
            className="size-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={next}
            disabled={!canGoNext}
            className="size-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] text-muted-foreground/60 font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((day, i) => {
          if (day === null)
            return <div key={`e${i}`} className="aspect-square" />;

          const status = monthData[day];
          const isToday = day === todayDate;
          const isFuture = isCurrentMonth && day > todayDate;

          return (
            <div
              key={day}
              className="aspect-square flex items-center justify-center"
            >
              {status === "active" ? (
                <div
                  className={`size-8 rounded-full bg-primary/12 flex items-center justify-center ${
                    isToday
                      ? "ring-2 ring-primary/40 ring-offset-1 ring-offset-background"
                      : ""
                  }`}
                >
                  <span className="text-sm leading-none">🔥</span>
                </div>
              ) : status === "freeze" ? (
                <div
                  className={`size-8 rounded-full bg-blue-500/12 flex items-center justify-center ${
                    isToday
                      ? "ring-2 ring-blue-400/40 ring-offset-1 ring-offset-background"
                      : ""
                  }`}
                >
                  <span className="text-sm leading-none">❄️</span>
                </div>
              ) : isToday ? (
                <div className="size-8 rounded-full border border-muted-foreground/20 flex items-center justify-center">
                  <span className="text-xs font-medium">{day}</span>
                </div>
              ) : (
                <span
                  className={`text-xs tabular-nums ${
                    isFuture
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ── */

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { t } = useLocale();

  const [xpBalance, setXpBalance] = useState<number | null>(null);
  const [liveStreak, setLiveStreak] = useState<StreakData | null>(null);
  const [liveAchievements, setLiveAchievements] = useState<
    Achievement[] | null
  >(null);
  const [liveActivity, setLiveActivity] = useState<ActivityItem[] | null>(null);
  const [allCourses, setAllCourses] = useState<CourseDetail[]>([]);
  const [enrollments, setEnrollments] = useState<CourseProgress[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [totalLearners, setTotalLearners] = useState<number>(0);

  useEffect(() => {
    if (!connected || !publicKey) return;
    const wallet = publicKey.toBase58();
    Promise.all([
      xpService.getBalance(wallet),
      streakService.getStreak(wallet),
      achievementService.getAchievements(wallet),
      activityService.getActivity(wallet),
      progressService.getAllEnrollments(wallet),
      leaderboardService.getRank(wallet),
      leaderboardService.getEntries("all-time", undefined, 1, 1),
      getAllCourses(),
    ]).then(([xp, streak, achieve, activity, enroll, userRank, lb, courses]) => {
      setXpBalance(xp);
      setLiveStreak(streak);
      setLiveAchievements(achieve);
      setLiveActivity(activity);
      setEnrollments(enroll);
      setRank(userRank);
      setTotalLearners(lb.total);
      setAllCourses(courses);
    });
  }, [connected, publicKey]);

  const xpData =
    xpBalance !== null
      ? xpProgress(xpBalance)
      : { level: 0, currentLevelXp: 0, xpToNextLevel: 100, progress: 0 };

  const totalXP = xpBalance ?? 0;
  const currentLevel = xpData.level;
  const xpPct = Math.round(xpData.progress * 100);

  const displayStreak: StreakData = liveStreak ?? {
    currentStreak: 0,
    longestStreak: 0,
    freezesRemaining: 0,
    freezesTotal: 3,
    todayCompleted: false,
    history: {},
  };
  const displayAchievements = liveAchievements ?? [];
  const displayActivity = liveActivity ?? [];

  // Enrolled courses: match progress to CMS courses
  const enrolled = useMemo(() => {
    return enrollments
      .map((progress) => {
        const course = allCourses.find((c) => c.slug === progress.courseId);
        if (!course) return null;
        return { ...course, completed: progress.completedLessons.length };
      })
      .filter((c): c is CourseDetail => c !== null);
  }, [enrollments, allCourses]);

  // Recommended: courses not enrolled in
  const recommended = useMemo(() => {
    const enrolledSlugs = new Set(enrollments.map((e) => e.courseId));
    return allCourses.filter((c) => !enrolledSlugs.has(c.slug)).slice(0, 3);
  }, [enrollments, allCourses]);

  // Convert streak history for calendar
  const calendarActivity = useMemo(() => {
    return historyToMonthly(displayStreak.history ?? {});
  }, [displayStreak]);

  function getNextLesson(course: CourseDetail, completedCount: number) {
    const allLessons = course.modules.flatMap((m) => m.lessons);
    return allLessons[completedCount] ?? null;
  }

  if (!connected) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-mesh animate-drift-2" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <Wallet className="size-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">{t("common.connectWallet")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noEnrolledCourses")}
          </p>
          <button
            onClick={() => setVisible(true)}
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t("common.connectWallet")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-mesh animate-drift-2" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-20">
        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <div className="text-xs text-muted-foreground/70 tabular-nums">
            {t("common.level")} {currentLevel}
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            {totalXP.toLocaleString()} XP
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            {t("common.rank")} #{rank ?? "–"}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mt-6 grid sm:grid-cols-2 rounded-xl border border-border/30 overflow-hidden">
          {/* Level + Achievements */}
          <div>
            <div className="p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                {t("dashboard.levelProgress")}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">
                  {currentLevel}
                </span>
                <span className="text-sm text-muted-foreground/60">
                  → {currentLevel + 1}
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-border/25">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground/60 tabular-nums">
                <span>
                  {xpData.currentLevelXp.toLocaleString()} /{" "}
                  {xpData.xpToNextLevel.toLocaleString()} XP
                </span>
                <span>{xpPct}%</span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground/60">
                #{rank ?? "–"}{" "}
                {totalLearners > 0 && (
                  <>
                    {t("common.of")} {totalLearners.toLocaleString()}{" "}
                    {t("common.learners")}
                  </>
                )}
              </p>
            </div>

            {/* Achievements */}
            <div className="px-5 pb-5">
              <div className="border-t border-border/20 pt-4">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                  {t("common.achievements")} · {displayAchievements.length}
                </p>
                {displayAchievements.length > 0 ? (
                  <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-4">
                    {displayAchievements.map((a, i) => {
                      const gradient: Record<string, string> = {
                        common:
                          "linear-gradient(160deg, #52525b, #a1a1aa, #52525b)",
                        rare: "linear-gradient(160deg, #1d4ed8, #60a5fa, #1d4ed8)",
                        epic: "linear-gradient(160deg, #6d28d9, #a78bfa, #6d28d9)",
                        legendary:
                          "linear-gradient(160deg, #b45309, #fbbf24, #f59e0b, #b45309)",
                      };
                      const shineStrength: Record<string, number> = {
                        common: 0.08,
                        rare: 0.12,
                        epic: 0.15,
                        legendary: 0.25,
                      };
                      const glow: Record<string, string> = {
                        common: "none",
                        rare: "drop-shadow(0 0 6px rgba(59,130,246,0.2))",
                        epic: "drop-shadow(0 0 6px rgba(139,92,246,0.25))",
                        legendary:
                          "drop-shadow(0 0 8px rgba(251,191,36,0.35))",
                      };
                      return (
                        <div key={a.id} className="group text-center">
                          <div
                            className={`relative mx-auto w-14 h-16 transition-transform duration-300 group-hover:scale-110 ${
                              a.rarity === "legendary"
                                ? "animate-badge-float"
                                : ""
                            }`}
                            style={{ filter: glow[a.rarity] }}
                            title={`${a.title} — ${a.description}`}
                          >
                            <div
                              className="absolute inset-0 badge-hex"
                              style={{ background: gradient[a.rarity] }}
                            />
                            <div className="absolute inset-0.5 badge-hex bg-card flex items-center justify-center">
                              <span className="text-xl leading-none">
                                {a.icon}
                              </span>
                            </div>
                            <div className="absolute inset-0 badge-hex pointer-events-none">
                              <div
                                className="absolute top-0 h-full w-3/5"
                                style={{
                                  background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,${shineStrength[a.rarity]}) 50%, transparent 70%)`,
                                  animation: `badge-shine 4s ease-in-out ${i * 0.5}s infinite`,
                                }}
                              />
                            </div>
                          </div>
                          <p className="mt-1.5 text-[9px] font-medium truncate leading-tight">
                            {a.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-muted-foreground/60">
                    {t("dashboard.noAchievements")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="p-5 border-t sm:border-t-0 sm:border-l border-border/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 44 56" className="h-12 w-auto" fill="none">
                    <path
                      d="M22 2C16 11 3 22 3 37C3 47.5 11.5 56 22 56S41 47.5 41 37C41 22 28 11 22 2Z"
                      className="fill-primary/15"
                    />
                    <path
                      d="M22 18C18 24 11 30 11 38C11 44.1 15.9 49 22 49S33 44.1 33 38C33 30 26 24 22 18Z"
                      className="fill-primary/25"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-primary tabular-nums">
                    {displayStreak.currentStreak}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {displayStreak.currentStreak} {t("dashboard.days")}{" "}
                    {t("common.streak").toLowerCase()}!
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {t("dashboard.longestStreak")}:{" "}
                    {displayStreak.longestStreak} {t("dashboard.days")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-blue-500/8 px-2 py-1">
                <span className="text-xs">❄️</span>
                <span className="text-[10px] text-blue-400/80 font-medium">
                  {displayStreak.freezesRemaining}/{displayStreak.freezesTotal}
                </span>
              </div>
            </div>

            <StreakCalendar monthlyActivity={calendarActivity} />
          </div>
        </div>

        {/* ── Continue Learning ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("dashboard.enrolledCourses")}
            </h2>
            <Link
              href="/courses"
              className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t("dashboard.allCourses")} <ArrowRight className="size-3" />
            </Link>
          </div>

          {enrolled.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border/30 overflow-hidden divide-y divide-border/15">
              {enrolled.map((course) => {
                const pct = Math.round(
                  (course.completed / course.lessons) * 100,
                );
                const next = getNextLesson(course, course.completed);

                return (
                  <div
                    key={course.slug}
                    className="p-4 hover:bg-muted/4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: `${course.accent}10`,
                          color: course.accent,
                        }}
                      >
                        <course.icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {course.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {t("dashboard.lessonsDetail", {
                            completed: course.completed,
                            total: course.lessons,
                          })}{" "}
                          · {course.difficulty} · {course.duration}
                        </p>
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground/70 shrink-0">
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-3 h-1 rounded-full bg-border/20">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: course.accent }}
                      />
                    </div>

                    {next && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
                          <LessonIcon type={next.type} />
                          {t("common.next")}: {next.title}
                        </span>
                        <Link
                          href={`/courses/${course.slug}/lessons/${next.id}`}
                          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {t("common.continue")}{" "}
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-border/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t("dashboard.noEnrolledCourses")}
              </p>
              <Link
                href="/courses"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {t("dashboard.allCourses")} <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Recommended ── */}
        {recommended.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t("dashboard.recommended")}
              </h2>
              <Link
                href="/courses"
                className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
              >
                {t("common.browseAll")} <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* ── Activity ── */}
        {displayActivity.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold">
              {t("dashboard.recentActivity")}
            </h2>

            <div className="mt-4 rounded-xl border border-border/30 overflow-hidden divide-y divide-border/10">
              {displayActivity.map((item) => {
                const translated = translateActivity(item, t);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <div
                      className={`mt-1.5 size-1.5 rounded-full shrink-0 ${activityDot[item.type] ?? "bg-muted-foreground/20"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{translated.title}</p>
                      {translated.courseName && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {translated.courseName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground/60">
                      {item.xp && (
                        <span className="text-primary font-medium">
                          +{item.xp} XP
                        </span>
                      )}
                      <span>{translated.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
