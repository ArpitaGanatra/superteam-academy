import type { ProgressService } from "./interfaces";
import type { CourseProgress } from "@/types";

const STORAGE_KEY = "academy_progress";

function loadProgress(): Record<string, Record<string, CourseProgress>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(
  data: Record<string, Record<string, CourseProgress>>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Stub implementation using localStorage.
 * Swap to on-chain enrollment PDAs when program is connected.
 *
 * On-chain mapping:
 * - enroll → program.methods.enroll(courseId) — learner signs directly
 * - completeLesson → POST /api/lessons/complete — backend signs complete_lesson
 * - finalizeCourse → POST /api/courses/finalize — backend signs finalize_course
 * - closeEnrollment → program.methods.closeEnrollment() — learner signs
 */
export class LocalProgressService implements ProgressService {
  async getProgress(
    wallet: string,
    courseId: string,
  ): Promise<CourseProgress | null> {
    const all = loadProgress();
    return all[wallet]?.[courseId] ?? null;
  }

  async getAllEnrollments(wallet: string): Promise<CourseProgress[]> {
    const all = loadProgress();
    return Object.values(all[wallet] ?? {});
  }

  async enroll(
    wallet: string,
    courseId: string,
  ): Promise<{ txSignature: string }> {
    const all = loadProgress();
    if (!all[wallet]) all[wallet] = {};

    if (all[wallet][courseId]) {
      return { txSignature: "already-enrolled" };
    }

    all[wallet][courseId] = {
      courseId,
      enrolledAt: Date.now(),
      completedAt: null,
      completedLessons: [],
      totalLessons: 0,
      credentialAsset: null,
    };

    saveProgress(all);
    return { txSignature: `stub-enroll-${Date.now()}` };
  }

  async completeLesson(
    wallet: string,
    courseId: string,
    lessonIndex: number,
  ): Promise<{ xpEarned: number; txSignature: string | null }> {
    const all = loadProgress();
    if (!all[wallet]?.[courseId]) {
      throw new Error("Not enrolled");
    }

    const progress = all[wallet][courseId];
    if (progress.completedLessons.includes(lessonIndex)) {
      return { xpEarned: 0, txSignature: null };
    }

    progress.completedLessons.push(lessonIndex);
    progress.completedLessons.sort((a, b) => a - b);
    saveProgress(all);

    // Stub XP: 25 per lesson
    return { xpEarned: 25, txSignature: `stub-lesson-${Date.now()}` };
  }

  async finalizeCourse(
    wallet: string,
    courseId: string,
  ): Promise<{ bonusXp: number; txSignature: string | null }> {
    const all = loadProgress();
    const progress = all[wallet]?.[courseId];
    if (!progress) throw new Error("Not enrolled");

    progress.completedAt = Date.now();
    saveProgress(all);

    // Stub bonus: 500 XP
    return { bonusXp: 500, txSignature: `stub-finalize-${Date.now()}` };
  }

  async closeEnrollment(
    wallet: string,
    courseId: string,
  ): Promise<{ txSignature: string }> {
    const all = loadProgress();
    if (all[wallet]?.[courseId]) {
      delete all[wallet][courseId];
      saveProgress(all);
    }
    return { txSignature: `stub-close-${Date.now()}` };
  }
}
