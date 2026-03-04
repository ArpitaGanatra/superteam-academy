import type { CourseDetail, LessonContent } from "@/types";
import { fetchFromCMS, queries } from "./sanity";
import {
  Blocks,
  Anchor,
  Landmark,
  Shield,
  Wallet,
  Coins,
  TestTube,
  ArrowLeftRight,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Blocks,
  Anchor,
  Landmark,
  Shield,
  Wallet,
  Coins,
  TestTube,
  ArrowLeftRight,
  GitBranch,
};

interface SanityCourse {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  difficulty: string;
  topic?: string;
  topicLabel?: string;
  duration: string;
  xp: number;
  accent?: string;
  icon?: string;
  codePreview?: string[];
  instructor?: { name: string; role: string };
  modules?: SanityModule[];
  reviews?: { name: string; rating: number; text: string }[];
  moduleCount?: number;
  lessonCount?: number;
}

interface SanityModule {
  _key: string;
  title: string;
  lessons?: SanityLesson[];
}

interface SanityLesson {
  _key: string;
  title: string;
  duration?: string;
  type?: string;
  markdown?: string;
  starterCode?: string;
  solutionCode?: string;
  hints?: string[];
  testCases?: { name: string; input: string; expected: string }[];
}

function mapCourse(c: SanityCourse): CourseDetail {
  const totalLessons =
    c.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ??
    c.lessonCount ??
    0;

  return {
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    longDescription: c.longDescription ?? c.description ?? "",
    difficulty: (c.difficulty as CourseDetail["difficulty"]) ?? "Beginner",
    topic: c.topic ?? "Core",
    topicLabel: c.topicLabel ?? (c.topic ?? "CORE").toUpperCase(),
    duration: c.duration ?? "1h",
    lessons: totalLessons,
    completed: 0,
    xp: c.xp ?? 0,
    accent: c.accent ?? "#34d399",
    icon: iconMap[c.icon ?? ""] ?? Blocks,
    codePreview: c.codePreview ?? [],
    instructor: c.instructor ?? { name: "Instructor", role: "Developer" },
    modules:
      c.modules?.map((m) => ({
        id: m._key,
        title: m.title,
        lessons:
          m.lessons?.map((l) => ({
            id: l._key,
            title: l.title,
            duration: l.duration ?? "5 min",
            type: (l.type as "video" | "reading" | "challenge") ?? "reading",
            completed: false,
          })) ?? [],
      })) ?? [],
    reviews: c.reviews ?? [],
  };
}

function mapLesson(l: SanityLesson, courseSlug: string): LessonContent {
  return {
    courseSlug,
    lessonId: l._key,
    title: l.title,
    type: (l.type as LessonContent["type"]) ?? "reading",
    markdown: l.markdown ?? "",
    starterCode: l.starterCode ?? undefined,
    solutionCode: l.solutionCode ?? undefined,
    hints: l.hints ?? undefined,
    testCases: l.testCases ?? undefined,
  };
}

export async function getAllCourses(): Promise<CourseDetail[]> {
  const data = await fetchFromCMS<SanityCourse[]>(queries.allCourses);
  if (data && data.length > 0) return data.map(mapCourse);
  return [];
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  const data = await fetchFromCMS<SanityCourse>(queries.courseBySlug, { slug });
  if (data) return mapCourse(data);
  return null;
}

export async function getLesson(
  courseSlug: string,
  lessonId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: string = "en",
): Promise<LessonContent | null> {
  const data = await fetchFromCMS<{ modules: { lessons: SanityLesson[] }[] }>(
    queries.lessonContent,
    { courseSlug, lessonId },
  );

  if (data?.modules) {
    for (const mod of data.modules) {
      for (const l of mod.lessons ?? []) {
        if (l._key === lessonId) return mapLesson(l, courseSlug);
      }
    }
  }

  return null;
}
