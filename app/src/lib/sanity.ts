/**
 * Sanity CMS client.
 *
 * Course content schema:
 * - course: title, slug, description, difficulty, duration, xp, modules[], track
 * - module: title, order, lessons[]
 * - lesson: title, type (content|challenge), body (portable text), starterCode, solutionCode, hints[], testCases[]
 * - track: name, description, accent, collectionAddress
 * - instructor: name, role, avatar, bio
 * - testimonial: name, text, rating
 *
 * For CMS setup, see docs/CMS_GUIDE.md
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2026-03-04",
      useCdn: true,
    })
  : null;

/* ── GROQ Queries ── */

export const queries = {
  allCourses: `*[_type == "course"] | order(order asc) {
    title,
    "slug": slug.current,
    description,
    difficulty,
    duration,
    xp,
    accent,
    "instructor": instructor->{name, role},
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  }`,

  courseBySlug: `*[_type == "course" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description,
    longDescription,
    difficulty,
    topic,
    topicLabel,
    duration,
    xp,
    accent,
    icon,
    codePreview,
    "instructor": instructor->{name, role, bio, avatar},
    modules[] {
      _key,
      title,
      lessons[] {
        _key,
        title,
        duration,
        type
      }
    },
    reviews[] {
      name,
      rating,
      text
    }
  }`,

  lessonContent: `*[_type == "course" && slug.current == $courseSlug][0] {
    modules[] {
      lessons[_key == $lessonId] {
        _key,
        title,
        type,
        markdown,
        starterCode,
        solutionCode,
        hints,
        testCases[] {
          name,
          input,
          expected
        }
      }
    }
  }`,
};

/* ── Fetchers ── */

export async function fetchFromCMS<T>(
  query: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch {
    return null;
  }
}
