import { defineType } from "sanity";

export const courseModule = defineType({
  name: "module",
  title: "Module",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    },
    {
      name: "lessons",
      title: "Lessons",
      type: "array",
      of: [{ type: "lesson" }],
    },
  ],
  preview: {
    select: { title: "title", lessons: "lessons" },
    prepare({ title, lessons }) {
      return { title, subtitle: `${lessons?.length ?? 0} lessons` };
    },
  },
});
