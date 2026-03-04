import { defineType } from "sanity";

export const instructor = defineType({
  name: "instructor",
  title: "Instructor",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    },
    { name: "role", title: "Role", type: "string" },
    { name: "bio", title: "Bio", type: "text" },
    {
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    },
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "avatar" },
  },
});
