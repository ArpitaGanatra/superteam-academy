"use client";

import Link from "next/link";
import { ArrowRight, Flame, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CourseDetail } from "@/data/courses";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "next-themes";

const difficultyKeys: Record<string, string> = {
  Beginner: "courses.beginner",
  Intermediate: "courses.intermediate",
  Advanced: "courses.advanced",
};

const topicKeys: Record<string, string> = {
  CORE: "courses.topicCore",
  FRAMEWORK: "courses.topicFramework",
  SECURITY: "courses.topicSecurity",
  DEFI: "courses.topicDeFi",
};

export function CourseCard({ course }: { course: CourseDetail }) {
  const { t } = useLocale();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const progress =
    course.completed > 0
      ? Math.round((course.completed / course.lessons) * 100)
      : 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm p-0 gap-0 overflow-hidden transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5">
        {/* Code preview header */}
        <div
          aria-hidden="true"
          className="relative h-36 overflow-hidden border-b border-border/50 px-5 pt-4"
          style={{ background: isDark ? "#0c0c0e" : "#f0fdf4" }}
        >
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[60px]"
            style={{ background: course.accent, opacity: isDark ? 0.3 : 0.2 }}
          />
          <div
            className={`font-mono text-xs leading-[1.7] ${isDark ? "text-[#a1a1aa66]" : "text-green-950"}`}
          >
            {course.codePreview.map((line, i) => (
              <div key={i} className="truncate">
                <span
                  className={`mr-3 inline-block w-3 text-right text-[10px] ${isDark ? "text-[#a1a1aa33]" : "text-green-950/50"}`}
                >
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </div>
          <div
            className="absolute bottom-3 left-5 flex size-9 items-center justify-center rounded-lg border font-mono text-xs font-bold"
            style={{
              borderColor: `${course.accent}40`,
              color: course.accent,
              background: `${course.accent}10`,
            }}
          >
            <course.icon className="size-4" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-12"
            style={{
              background: `linear-gradient(to top, ${isDark ? "#0c0c0e" : "#f0fdf4"}, transparent)`,
            }}
          />
        </div>

        {/* Card body */}
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: course.accent }}
            >
              {t(topicKeys[course.topicLabel] ?? "courses.topicCore")}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {t(difficultyKeys[course.difficulty] ?? "courses.beginner")}
            </Badge>
          </div>
          <CardTitle className="mt-1.5 text-base tracking-tight">
            {t(`courseContent.${course.slug}.title`)}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed line-clamp-2">
            {t(`courseContent.${course.slug}.description`)}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {course.duration}
            </span>
            <span>{t("courses.lessonsCount", { count: course.lessons })}</span>
            <span className="ml-auto flex items-center gap-1">
              <Flame className="size-3 text-xp" />
              {course.xp} XP
            </span>
          </div>

          {/* Progress */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: course.accent,
              }}
            />
          </div>
          {progress > 0 && (
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {t("courses.completedProgress", {
                completed: course.completed,
                total: course.lessons,
              })}
            </p>
          )}

          <div
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: course.accent }}
          >
            {t("courses.viewCourse")} <ArrowRight className="size-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
