import { BUSINESS } from '@/lib/business';
import { SITE_NAME, SITE_URL, SITE_AUTHOR, absoluteUrl } from '@/lib/seo';

/**
 * schema.org node builders.
 *
 * Only WebSite and Organization are global (emitted from the root layout).
 * Everything else lives on the route it actually describes — emitting a Book or
 * FAQPage on every page of the site, as this app used to, is both noise and a
 * structured-data policy problem when the content isn't visible on the page.
 */

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const AUTHOR_ID = `${SITE_URL}/#david-crowell`;

/** Stable @id for a course (a community space of type COURSE). */
export const courseId = (spaceSlug: string) => absoluteUrl(`/community/${spaceSlug}`) + '#course';

/** Stable @id for a module. Must match its entry in the parent course's hasPart. */
export const moduleId = (spaceSlug: string, moduleSlug: string) =>
    absoluteUrl(`/community/${spaceSlug}/${moduleSlug}`) + '#course';

export const lessonId = (spaceSlug: string, moduleSlug: string, lessonSlug: string) =>
    absoluteUrl(`/community/${spaceSlug}/${moduleSlug}/${lessonSlug}`) + '#article';

/**
 * Built from BUSINESS rather than literals. Those values must match the TCR /
 * Telnyx brand record exactly or carriers reject the 10DLC campaign — a second
 * hardcoded copy is a live compliance risk, not just duplication.
 */
export function organizationSchema() {
    return {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: BUSINESS.displayName,
        legalName: BUSINESS.legalName,
        url: SITE_URL,
        description:
            'Intentional living platform combining wellness principles with AI-informed perspectives',
        email: BUSINESS.email,
        telephone: BUSINESS.phone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: BUSINESS.address.street,
            addressLocality: BUSINESS.address.city,
            addressRegion: BUSINESS.address.state,
            postalCode: BUSINESS.address.postalCode,
            addressCountry: BUSINESS.address.country,
        },
        sameAs: ['https://www.youtube.com/@b.justbe', 'https://shop.theblife.com'],
    };
}

/**
 * No `potentialAction`/SearchAction: the previous one targeted `/news?q=`, which
 * redirects anonymous users to sign-in and never reads a `q` param. Pointing a
 * SearchAction at a login wall is worse than omitting it. Re-add if site search
 * is ever built.
 */
export function websiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'A digital sanctuary for intentional living in the modern world',
        inLanguage: 'en-US',
        publisher: { '@id': ORG_ID },
    };
}

export function authorSchema() {
    return {
        '@type': 'Person',
        '@id': AUTHOR_ID,
        name: SITE_AUTHOR,
        url: absoluteUrl('/about'),
    };
}

export interface BreadcrumbItem {
    name: string;
    /** Site-relative path. Omit for the current page (the last crumb). */
    path?: string;
}

/**
 * Mirrors the visual breadcrumb in `components/community/community-breadcrumb.tsx`
 * — same labels, same order — with the site root prepended so the list is
 * well-formed.
 */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            ...(item.path ? { item: absoluteUrl(item.path) } : {}),
        })),
    };
}

/** ISO 8601 duration from a lesson count, at roughly 3 minutes of reading each. */
export function workloadFromLessons(lessonCount: number): string {
    const minutes = Math.max(5, lessonCount * 3);
    if (minutes < 60) return `PT${minutes}M`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem ? `PT${hours}H${rem}M` : `PT${hours}H`;
}

interface CourseInstanceOptions {
    lessonCount: number;
    withInstructor?: boolean;
}

function courseInstance({ lessonCount, withInstructor }: CourseInstanceOptions) {
    return {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: workloadFromLessons(lessonCount),
        ...(withInstructor ? { instructor: { '@id': AUTHOR_ID } } : {}),
    };
}

export interface ModuleSchemaInput {
    spaceSlug: string;
    slug: string;
    title: string;
    description: string;
    lessonCount: number;
}

/**
 * A module renders as a sub-Course. Shared by the course landing (inside
 * `hasPart`) and the module page itself so the `@id`s are guaranteed identical —
 * Google needs `provider` and `hasCourseInstance` on nested Course nodes too.
 */
export function moduleSchema(input: ModuleSchemaInput, parentSpaceSlug?: string) {
    return {
        '@type': 'Course',
        '@id': moduleId(input.spaceSlug, input.slug),
        name: input.title,
        url: absoluteUrl(`/community/${input.spaceSlug}/${input.slug}`),
        description: input.description,
        provider: { '@id': ORG_ID },
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        hasCourseInstance: [courseInstance({ lessonCount: input.lessonCount })],
        ...(parentSpaceSlug ? { isPartOf: { '@id': courseId(parentSpaceSlug) } } : {}),
    };
}

export interface CourseSchemaInput {
    spaceSlug: string;
    name: string;
    description: string;
    image?: string;
    modules: ModuleSchemaInput[];
}

export function courseSchema(input: CourseSchemaInput) {
    const totalLessons = input.modules.reduce((sum, m) => sum + m.lessonCount, 0);
    return {
        '@type': 'Course',
        '@id': courseId(input.spaceSlug),
        name: input.name,
        url: absoluteUrl(`/community/${input.spaceSlug}`),
        description: input.description,
        ...(input.image ? { image: absoluteUrl(input.image) } : {}),
        provider: { '@id': ORG_ID },
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        educationalLevel: 'Beginner',
        // price 0 is what produces the "Free" label in Google's Course carousel.
        offers: [
            {
                '@type': 'Offer',
                price: 0,
                priceCurrency: 'USD',
                category: 'Free',
                availability: 'https://schema.org/InStock',
            },
        ],
        hasCourseInstance: [courseInstance({ lessonCount: totalLessons, withInstructor: true })],
        hasPart: input.modules.map(m => moduleSchema(m)),
    };
}

export interface LessonSchemaInput {
    spaceSlug: string;
    moduleSlug: string;
    slug: string;
    title: string;
    description: string;
    moduleTitle: string;
    wordCount: number;
    datePublished: Date;
    dateModified: Date;
    image?: string;
}

/**
 * Multi-typed: `LearningResource` alone produces no rich result, while `Article`
 * gets Google's article handling. Both are valid on one node.
 */
export function lessonSchema(input: LessonSchemaInput) {
    const url = absoluteUrl(`/community/${input.spaceSlug}/${input.moduleSlug}/${input.slug}`);
    return {
        '@type': ['Article', 'LearningResource'],
        '@id': lessonId(input.spaceSlug, input.moduleSlug, input.slug),
        headline: input.title.slice(0, 110),
        name: input.title,
        description: input.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        learningResourceType: 'Lesson',
        educationalLevel: 'Beginner',
        articleSection: input.moduleTitle,
        wordCount: input.wordCount,
        datePublished: input.datePublished.toISOString(),
        dateModified: input.dateModified.toISOString(),
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': moduleId(input.spaceSlug, input.moduleSlug) },
        ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    };
}

/** Wraps nodes in the @context envelope for a single <script> block. */
export function graph(...nodes: object[]) {
    return { '@context': 'https://schema.org', '@graph': nodes };
}
