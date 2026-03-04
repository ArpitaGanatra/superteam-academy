# CMS Guide — Sanity Integration

## Overview

Course content can be managed through Sanity CMS. The integration is optional — the app falls back to local mock data when no Sanity project is configured.

## Setup

1. Create a Sanity project at [sanity.io](https://sanity.io)
2. Set environment variables:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

3. Deploy the schemas below to your Sanity studio

## Content Schemas

### Course
```js
{
  name: 'course',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text' },
    { name: 'longDescription', type: 'text' },
    { name: 'difficulty', type: 'string', options: { list: ['Beginner', 'Intermediate', 'Advanced'] } },
    { name: 'topic', type: 'string' },
    { name: 'duration', type: 'string' },
    { name: 'xp', type: 'number' },
    { name: 'accent', type: 'string' },
    { name: 'codePreview', type: 'array', of: [{ type: 'string' }] },
    { name: 'instructor', type: 'reference', to: [{ type: 'instructor' }] },
    { name: 'modules', type: 'array', of: [{ type: 'module' }] },
    { name: 'reviews', type: 'array', of: [{ type: 'review' }] },
  ]
}
```

### Module (object type)
```js
{
  name: 'module',
  type: 'object',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'lessons', type: 'array', of: [{ type: 'lesson' }] },
  ]
}
```

### Lesson (object type)
```js
{
  name: 'lesson',
  type: 'object',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'type', type: 'string', options: { list: ['content', 'challenge'] } },
    { name: 'duration', type: 'string' },
    { name: 'body', type: 'array', of: [{ type: 'block' }] },
    { name: 'starterCode', type: 'text' },
    { name: 'solutionCode', type: 'text' },
    { name: 'hints', type: 'array', of: [{ type: 'string' }] },
    { name: 'testCases', type: 'array', of: [{ type: 'testCase' }] },
  ]
}
```

### Instructor
```js
{
  name: 'instructor',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'bio', type: 'text' },
    { name: 'avatar', type: 'image' },
  ]
}
```

## GROQ Queries

All queries are defined in `src/lib/sanity.ts`:

- `allCourses` — Course catalog listing
- `courseBySlug` — Full course detail with modules, lessons, reviews
- `lessonContent` — Single lesson content with code and test cases

## Usage

```typescript
import { fetchFromCMS, queries } from "@/lib/sanity";

// Fetch all courses
const courses = await fetchFromCMS(queries.allCourses);

// Fetch single course
const course = await fetchFromCMS(queries.courseBySlug, { slug: "solana-101" });

// Fetch lesson content
const lesson = await fetchFromCMS(queries.lessonContent, {
  courseSlug: "solana-101",
  lessonId: "lesson-key-123",
});
```

## Fallback Behavior

When `NEXT_PUBLIC_SANITY_PROJECT_ID` is not set:
- `sanityClient` is `null`
- `fetchFromCMS()` returns `null`
- Pages use local mock data from `src/data/`
