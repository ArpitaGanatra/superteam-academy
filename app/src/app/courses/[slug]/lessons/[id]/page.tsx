"use client";

import { useState, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Play,
  FileText,
  Code,
  Lightbulb,
  Eye,
  EyeOff,
  BookOpen,
  Menu,
  X,
  Flame,
  Loader2,
  CircleX,
  Terminal,
  RotateCcw,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { getCourseBySlug } from "@/data/courses";
import { getLessonContent, type TestCase } from "@/data/lesson-content";

/* ── Helpers ── */

function LessonTypeIcon({ type }: { type: "video" | "reading" | "challenge" }) {
  if (type === "video") return <Play className="size-3.5" />;
  if (type === "challenge") return <Code className="size-3.5" />;
  return <FileText className="size-3.5" />;
}

/* ── Simple Markdown Renderer ── */

function MarkdownRenderer({ content }: { content: string }) {
  const html = useMemo(() => {
    const result = content
      .replace(
        /```(\w*)\n([\s\S]*?)```/g,
        (_, lang, code) =>
          `<div class="my-4 rounded-lg border border-border/50 bg-[#0c0c0e] overflow-hidden"><div class="flex items-center gap-2 px-4 py-2 border-b border-border/50 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">${lang || "code"}</div><pre class="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#a1a1aa]"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`,
      )
      .replace(
        /\|(.+)\|\n\|[-|\s]+\|\n((?:\|.+\|\n?)*)/g,
        (_, header, body) => {
          const headers = header
            .split("|")
            .map((h: string) => h.trim())
            .filter(Boolean);
          const rows = body
            .trim()
            .split("\n")
            .map((row: string) =>
              row
                .split("|")
                .map((cell: string) => cell.trim())
                .filter(Boolean),
            );
          return `<div class="my-4 overflow-x-auto"><table class="w-full text-sm"><thead><tr>${headers.map((h: string) => `<th class="text-left p-2 border-b border-border/50 text-muted-foreground font-medium">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row: string[]) => `<tr>${row.map((cell: string) => `<td class="p-2 border-b border-border/30">${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        },
      )
      .replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary">$1</code>',
      )
      .replace(
        /^> (.+)$/gm,
        '<blockquote class="my-4 border-l-2 border-primary/40 pl-4 text-muted-foreground italic">$1</blockquote>',
      )
      .replace(
        /^### (.+)$/gm,
        '<h3 class="mt-6 mb-2 text-base font-semibold tracking-tight">$1</h3>',
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 class="mt-8 mb-3 text-xl font-semibold tracking-tight">$1</h2>',
      )
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /^(\d+)\. (.+)$/gm,
        '<li class="ml-4 list-decimal text-sm leading-relaxed mb-1">$2</li>',
      )
      .replace(
        /^- (.+)$/gm,
        '<li class="ml-4 list-disc text-sm leading-relaxed mb-1">$1</li>',
      )
      .replace(
        /^(?!<[a-z]|$)(.+)$/gm,
        '<p class="text-sm leading-relaxed text-foreground/90 mb-2">$1</p>',
      );

    return result;
  }, [content]);

  return (
    <div className="prose-custom" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/* ── Test Result type ── */

type TestResult = "idle" | "pass" | "fail";

/* ── Code Challenge Panel ── */

function ChallengeEditor({
  code,
  onChange,
  language,
  testCases,
  accent,
  xpReward,
  onComplete,
}: {
  code: string;
  onChange: (code: string) => void;
  language: string;
  testCases: TestCase[];
  accent: string;
  xpReward: number;
  onComplete: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>(
    testCases.map(() => "idle"),
  );
  const [output, setOutput] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"tests" | "output">("tests");
  const [allPassed, setAllPassed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const passedCount = testResults.filter((r) => r === "pass").length;
  const failedCount = testResults.filter((r) => r === "fail").length;
  const hasRun = testResults.some((r) => r !== "idle");

  const handleRun = useCallback(() => {
    setRunning(true);
    setOutput(["Compiling...", ""]);
    setActiveTab("tests");
    setAllPassed(false);
    setShowCelebration(false);

    // Simulate progressive test execution
    const results: TestResult[] = testCases.map(() => "idle");
    setTestResults([...results]);

    function runTest(i: number) {
      if (i >= testCases.length) {
        setRunning(false);

        const allPass = results.every((r) => r === "pass");
        const passCount = results.filter((r) => r === "pass").length;
        const failCount = results.filter((r) => r === "fail").length;

        setOutput((prev) => [
          ...prev,
          "",
          `Test results: ${passCount} passed, ${failCount} failed`,
          "",
          allPass
            ? `All tests passed! +${xpReward} XP`
            : `${failCount} test(s) failed. Check your implementation.`,
        ]);

        if (allPass) {
          setAllPassed(true);
          setShowCelebration(true);
          // Fire star confetti burst
          const defaults = {
            spread: 360,
            ticks: 100,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
          };
          const shoot = () => {
            confetti({
              ...defaults,
              particleCount: 40,
              scalar: 1.2,
              shapes: ["star"],
            });
            confetti({
              ...defaults,
              particleCount: 10,
              scalar: 0.75,
              shapes: ["circle"],
            });
          };
          // 3 rounds of bursts
          setTimeout(shoot, 0);
          setTimeout(shoot, 100);
          setTimeout(shoot, 200);
          setTimeout(shoot, 800);
          setTimeout(shoot, 900);
          setTimeout(shoot, 1000);
          setTimeout(shoot, 1600);
          setTimeout(shoot, 1700);
          setTimeout(shoot, 1800);
        }
        return;
      }

      const tc = testCases[i]!;
      const hasImplementation = !code.includes("// TODO") || code.length > 300;
      const passChance = hasImplementation ? 0.85 : 0.2;
      const passed = Math.random() < passChance;

      results[i] = passed ? "pass" : "fail";
      setTestResults([...results]);
      setOutput((prev) => [
        ...prev,
        `${passed ? "✓" : "✗"} ${tc.name}${passed ? "" : ` — expected: ${tc.expected}`}`,
      ]);

      setTimeout(() => runTest(i + 1), 400);
    }

    setTimeout(() => runTest(0), 400);
  }, [code, testCases, xpReward]);

  const handleReset = useCallback(() => {
    setTestResults(testCases.map(() => "idle"));
    setOutput([]);
    setAllPassed(false);
    setShowCelebration(false);
  }, [testCases]);

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in duration-500">
            <div
              className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full"
              style={{ background: `${accent}20` }}
            >
              <Trophy className="size-8" style={{ color: accent }} />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Challenge Complete!
            </h3>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-amber-400">
              <Sparkles className="size-4" />
              <span className="font-medium">+{xpReward} XP</span>
            </div>
            <Button
              size="sm"
              className="mt-4"
              variant="outline"
              onClick={() => {
                setShowCelebration(false);
                onComplete();
              }}
            >
              Continue
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {language}
          </span>
          {hasRun && (
            <div className="flex items-center gap-2 text-[11px]">
              {passedCount > 0 && (
                <span className="text-emerald-400">{passedCount} passed</span>
              )}
              {failedCount > 0 && (
                <span className="text-red-400">{failedCount} failed</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={handleReset}
            className="text-[11px] text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
          <Button
            size="xs"
            onClick={handleRun}
            disabled={running}
            className="h-7 px-3 text-[11px] font-medium"
            style={{
              background: running ? undefined : accent,
              color: running ? undefined : "#000",
            }}
          >
            {running ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="size-3" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code editor area */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-border/30 bg-[#0c0c0e] overflow-hidden pointer-events-none z-10">
          <div className="pt-4 px-2 font-mono text-[11px] leading-[1.65] text-[#a1a1aa33] text-right">
            {code.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full resize-none bg-transparent pl-14 pr-4 pt-4 pb-4 font-mono text-[13px] leading-[1.65] text-[#a1a1aa] outline-none caret-primary"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Bottom panel: test cases + output */}
      <div className="border-t border-border/50 h-[200px] flex flex-col shrink-0">
        {/* Tabs */}
        <div className="flex items-center border-b border-border/50 px-2">
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors ${
              activeTab === "tests"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Tests
            {hasRun && (
              <span className="ml-1.5">
                ({passedCount}/{testCases.length})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("output")}
            className={`px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors ${
              activeTab === "output"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Terminal className="size-3 inline mr-1" />
            Output
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "tests" ? (
            <div className="p-2 space-y-1">
              {testCases.map((tc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md px-2.5 py-2 text-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {testResults[i] === "pass" ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : testResults[i] === "fail" ? (
                      <CircleX className="size-3.5 text-red-400" />
                    ) : (
                      <div className="size-3.5 rounded-full border border-border/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${
                        testResults[i] === "fail"
                          ? "text-red-400"
                          : testResults[i] === "pass"
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {tc.name}
                    </p>
                    <div className="mt-0.5 flex gap-4 text-[10px] text-muted-foreground">
                      <span>
                        Input:{" "}
                        <code className="text-[#a1a1aa]">{tc.input}</code>
                      </span>
                      <span>
                        Expected:{" "}
                        <code className="text-[#a1a1aa]">{tc.expected}</code>
                      </span>
                    </div>
                    {testResults[i] === "fail" && (
                      <p className="mt-1 text-[10px] text-red-400/80">
                        Check your implementation against the expected output.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {allPassed && (
                <div
                  className="mt-2 rounded-lg border px-3 py-2.5 text-xs flex items-center gap-2"
                  style={{
                    borderColor: `${accent}40`,
                    background: `${accent}10`,
                    color: accent,
                  }}
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="font-medium">
                    All tests passed! Challenge complete.
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Flame className="size-3" />+{xpReward} XP
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 font-mono text-[11px] leading-relaxed text-[#a1a1aa] whitespace-pre-wrap">
              {output.length > 0
                ? output.join("\n")
                : "Click 'Run Tests' to see output..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Module sidebar ── */

function LessonSidebar({
  courseSlug,
  course,
  currentLessonId,
  accent,
  onClose,
}: {
  courseSlug: string;
  course: ReturnType<typeof getCourseBySlug>;
  currentLessonId: string;
  accent: string;
  onClose?: () => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const currentModule = course?.modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId),
    );
    return new Set(currentModule ? [currentModule.id] : []);
  });

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  if (!course) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{course.title}</p>
          <p className="text-[11px] text-muted-foreground">
            {course.lessons} lessons
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, mi) => {
          const isExpanded = expandedModules.has(module.id);
          return (
            <div key={module.id}>
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="text-xs font-medium truncate">
                  {mi + 1}. {module.title}
                </span>
              </button>
              {isExpanded && (
                <div className="pb-1">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                        className={`flex items-center gap-2.5 px-4 pl-9 py-2 text-xs transition-colors ${
                          isCurrent
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                        }`}
                      >
                        {lesson.completed ? (
                          <CheckCircle2
                            className="size-3.5 shrink-0"
                            style={{ color: accent }}
                          />
                        ) : (
                          <LessonTypeIcon type={lesson.type} />
                        )}
                        <span className="truncate">{lesson.title}</span>
                        <span className="ml-auto text-[10px] shrink-0">
                          {lesson.duration}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ── */

export default function LessonPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  // key={id} on LessonContent resets all state when navigating between lessons
  return <LessonContent key={id} slug={slug} id={id} />;
}

function LessonContent({ slug, id }: { slug: string; id: string }) {
  const course = getCourseBySlug(slug);
  const lessonContent = getLessonContent(slug, id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [expandedHints, setExpandedHints] = useState<Set<number>>(new Set());
  const [editorCode, setEditorCode] = useState(
    lessonContent?.starterCode || "",
  );
  const [completed, setCompleted] = useState(false);

  // Find lesson metadata from course
  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex((l) => l.id === id);
  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const language =
    course?.topic === "Core" && course?.slug.includes("wallet")
      ? "typescript"
      : course?.topic === "Framework" ||
          course?.topic === "DeFi" ||
          course?.topic === "Security"
        ? "rust"
        : "typescript";

  const xpPerLesson = course ? Math.round(course.xp / course.lessons) : 100;

  function toggleHint(index: number) {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // 404
  if (!course || !currentLesson) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="size-12 text-muted-foreground/60 mx-auto" />
          <h1 className="mt-4 text-xl font-semibold">Lesson not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This lesson doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href={`/courses/${slug}`}>
              <ArrowLeft className="size-3.5" />
              Back to course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isChallenge = currentLesson.type === "challenge";
  const hasContent = !!lessonContent;
  const hasTestCases =
    lessonContent?.testCases && lessonContent.testCases.length > 0;

  const markdownContent =
    lessonContent?.markdown ??
    `## ${currentLesson.title}\n\nLesson content is coming soon. Check back later!\n\n> This lesson is part of the **${course.title}** course.`;

  return (
    <div className="fixed inset-0 top-14 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-2 bg-card/80 backdrop-blur-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <Link
          href={`/courses/${slug}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="h-4 w-px bg-border/50" />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <LessonTypeIcon type={currentLesson.type} />
          <span className="text-sm font-medium truncate">
            {currentLesson.title}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
            {currentLesson.type}
          </Badge>
          {completed && (
            <Badge
              className="text-[10px] px-1.5 py-0 shrink-0"
              style={{ background: course.accent, color: "#000" }}
            >
              <CheckCircle2 className="size-2.5" />
              Done
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {currentLesson.duration}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="size-3 text-xp" />
            <span>{xpPerLesson} XP</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "fixed inset-0 top-14 z-40 bg-background" : "hidden"
          } lg:relative lg:block lg:z-auto w-64 shrink-0 border-r border-border/50 bg-card/40 overflow-hidden`}
        >
          <LessonSidebar
            courseSlug={slug}
            course={course}
            currentLessonId={id}
            accent={course.accent}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Content area */}
        {isChallenge && hasContent ? (
          <ResizablePanelGroup orientation="horizontal" className="flex-1">
            {/* Left: challenge prompt */}
            <ResizablePanel defaultSize={45} minSize={25}>
              <div className="h-full overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6 pb-24">
                  <MarkdownRenderer content={markdownContent} />

                  {/* Test cases preview */}
                  {hasTestCases && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Code
                          className="size-4"
                          style={{ color: course.accent }}
                        />
                        Test Cases
                      </h3>
                      <div className="space-y-1.5">
                        {lessonContent.testCases!.map((tc, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 px-3 py-2 text-xs"
                          >
                            <p className="font-medium text-foreground/90">
                              {tc.name}
                            </p>
                            <p className="mt-0.5 text-muted-foreground">
                              Expected: {tc.expected}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hints */}
                  {lessonContent?.hints && lessonContent.hints.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="size-4 text-amber-400" />
                        Hints
                      </h3>
                      <div className="space-y-2">
                        {lessonContent.hints.map((hint, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleHint(i)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                            >
                              {expandedHints.has(i) ? (
                                <Eye className="size-3.5" />
                              ) : (
                                <EyeOff className="size-3.5" />
                              )}
                              Hint {i + 1}
                            </button>
                            {expandedHints.has(i) && (
                              <div className="px-3 pb-3 text-xs text-muted-foreground border-t border-border/30 pt-2">
                                {hint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Solution toggle */}
                  {lessonContent?.solutionCode && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSolution(!showSolution)}
                        className="text-xs"
                      >
                        {showSolution ? (
                          <>
                            <EyeOff className="size-3.5" />
                            Hide Solution
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" />
                            Show Solution
                          </>
                        )}
                      </Button>
                      {showSolution && (
                        <div className="mt-3 rounded-lg border border-border/50 bg-[#0c0c0e] p-4 overflow-x-auto">
                          <pre className="font-mono text-[13px] leading-relaxed text-[#a1a1aa]">
                            <code>{lessonContent.solutionCode}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            {/* Right: code editor + tests */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <ChallengeEditor
                code={editorCode}
                onChange={setEditorCode}
                language={language}
                testCases={lessonContent?.testCases ?? []}
                accent={course.accent}
                xpReward={xpPerLesson}
                onComplete={() => setCompleted(true)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Full-width layout for reading/video */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 pb-24">
              <MarkdownRenderer content={markdownContent} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div>
          {prevLesson ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">{prevLesson.title}</span>
                <span className="sm:hidden">Previous</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${slug}`}>
                <ArrowLeft className="size-3.5" />
                Course overview
              </Link>
            </Button>
          )}
        </div>

        <Button
          size="sm"
          className="font-medium"
          onClick={() => setCompleted(true)}
          disabled={completed}
          style={
            completed ? undefined : { background: course.accent, color: "#000" }
          }
        >
          {completed ? (
            <>
              <CheckCircle2 className="size-3.5" />
              Completed
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5" />
              Mark Complete
            </>
          )}
        </Button>

        <div>
          {nextLesson ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                <span className="hidden sm:inline">{nextLesson.title}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${slug}`}>
                Finish course
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
