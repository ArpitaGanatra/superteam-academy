import { defineType } from "sanity";

export const testCase = defineType({
  name: "testCase",
  title: "Test Case",
  type: "object",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    },
    { name: "input", title: "Input", type: "text", rows: 3 },
    { name: "expected", title: "Expected Output", type: "text", rows: 3 },
  ],
});
