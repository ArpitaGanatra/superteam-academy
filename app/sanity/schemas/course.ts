import { defineType } from "sanity";

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    },
    { name: "description", title: "Short Description", type: "text", rows: 3 },
    {
      name: "longDescription",
      title: "Long Description",
      type: "text",
      rows: 6,
    },
    {
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: { list: ["Beginner", "Intermediate", "Advanced"] },
      validation: (r) => r.required(),
    },
    {
      name: "topic",
      title: "Topic",
      type: "string",
      description: "e.g. Core, Framework, DeFi, Security",
    },
    {
      name: "topicLabel",
      title: "Topic Label",
      type: "string",
      description: "Uppercase label for badge",
    },
    {
      name: "duration",
      title: "Duration",
      type: "string",
      description: "e.g. 4h",
    },
    { name: "xp", title: "Total XP", type: "number" },
    {
      name: "accent",
      title: "Accent Color",
      type: "string",
      description: "Hex color e.g. #34d399",
    },
    {
      name: "icon",
      title: "Icon",
      type: "string",
      description:
        "Lucide icon name: Blocks, Anchor, Shield, Wallet, Coins, TestTube, Landmark, ArrowLeftRight, GitBranch",
    },
    {
      name: "codePreview",
      title: "Code Preview Lines",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "instructor",
      title: "Instructor",
      type: "reference",
      to: [{ type: "instructor" }],
    },
    {
      name: "order",
      title: "Sort Order",
      type: "number",
      description: "Lower = shown first",
    },
    {
      name: "modules",
      title: "Modules",
      type: "array",
      of: [{ type: "module" }],
    },
    {
      name: "reviews",
      title: "Reviews",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Reviewer", type: "string" },
            {
              name: "rating",
              title: "Rating",
              type: "number",
              validation: (r) => r.min(1).max(5),
            },
            { name: "text", title: "Review Text", type: "text" },
          ],
        },
      ],
    },
  ],
  orderings: [
    {
      title: "Sort Order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "difficulty" },
  },
});
