import { defineType } from "sanity";

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    },
    {
      name: "duration",
      title: "Duration",
      type: "string",
      description: "e.g. 8 min",
    },
    {
      name: "type",
      title: "Type",
      type: "string",
      options: { list: ["video", "reading", "challenge"] },
      initialValue: "reading",
      validation: (r) => r.required(),
    },
    {
      name: "markdown",
      title: "Content (Markdown)",
      type: "text",
      description: "Full lesson content in markdown",
    },
    {
      name: "starterCode",
      title: "Starter Code",
      type: "text",
      hidden: ({ parent }) => parent?.type !== "challenge",
    },
    {
      name: "solutionCode",
      title: "Solution Code",
      type: "text",
      hidden: ({ parent }) => parent?.type !== "challenge",
    },
    {
      name: "hints",
      title: "Hints",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => parent?.type !== "challenge",
    },
    {
      name: "testCases",
      title: "Test Cases",
      type: "array",
      of: [{ type: "testCase" }],
      hidden: ({ parent }) => parent?.type !== "challenge",
    },
  ],
  preview: {
    select: { title: "title", type: "type" },
    prepare({ title, type }) {
      const icons: Record<string, string> = {
        video: "🎬",
        reading: "📖",
        challenge: "💻",
      };
      return { title, subtitle: `${icons[type] || ""} ${type}` };
    },
  },
});
