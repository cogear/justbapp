/**
 * The only place course URLs are constructed.
 *
 * Every href, canonical, sitemap entry and JSON-LD `url` goes through these, so
 * the next change to the URL shape is one file rather than a grep across the
 * component tree — which is how the old query-string form ended up duplicated in
 * five places.
 */
export const coursePath = (spaceSlug: string) => `/community/${spaceSlug}`;

export const modulePath = (spaceSlug: string, moduleSlug: string) =>
    `/community/${spaceSlug}/${moduleSlug}`;

export const lessonPath = (spaceSlug: string, moduleSlug: string, lessonSlug: string) =>
    `/community/${spaceSlug}/${moduleSlug}/${lessonSlug}`;
