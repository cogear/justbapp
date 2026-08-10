import type { Metadata } from 'next';

/**
 * Single source of truth for site identity in metadata.
 *
 * Canonicals are emitted as *relative* paths — `metadataBase` in the root layout
 * resolves them to absolute URLs. Never hardcode `https://theblife.com/...` in a
 * page's `alternates.canonical`; pass a path to `buildMetadata` instead.
 *
 * `absoluteUrl()` exists for the places that genuinely require an absolute URL:
 * JSON-LD `@id`/`url` fields and sitemap `<loc>` entries.
 */
export const SITE_URL = 'https://theblife.com';
export const SITE_NAME = 'b. Just Be';
export const SITE_AUTHOR = 'David Crowell';

/** A genuine 1200x630 crop. hero-community.jpg is 2048x1152 (16:9) and was
 *  previously declared as 1200x630, which is neither its size nor its ratio. */
export const DEFAULT_OG_IMAGE = {
    url: '/images/og/default.jpg',
    width: 1200,
    height: 630,
    alt: 'b. — a community for intentional living',
};

const DEFAULT_DESCRIPTION =
    'A digital sanctuary for intentional living. Explore wellness principles, AI-informed perspectives, and community courses.';

/** Absolute URL for a site-relative path. Use only where absolute is required. */
export function absoluteUrl(path = '/'): string {
    return new URL(path, SITE_URL).toString();
}

/**
 * Trim a description to a search-snippet-friendly length on a word boundary,
 * falling back to the site description rather than ever emitting an empty string.
 * `extractSummary()` returns '' for markdown that matches none of its patterns,
 * so an unguarded pass-through would silently produce description-less pages.
 */
export function toDescription(input: string | null | undefined, fallback = DEFAULT_DESCRIPTION): string {
    const text = (input ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return fallback;
    if (text.length <= 155) return text;
    return text.slice(0, 155).replace(/\s+\S*$/, '').replace(/[.,;:—-]+$/, '') + '…';
}

export interface BuildMetadataOptions {
    /** Page title WITHOUT the brand suffix — the root layout template adds it. */
    title: string;
    description?: string | null;
    /** Site-relative path, e.g. '/community/ai-for-humans'. Becomes the canonical. */
    path: string;
    image?: { url: string; width?: number; height?: number; alt?: string };
    type?: 'website' | 'article';
    /** Set for pages that must not be indexed (auth-gated, thin, or duplicated). */
    noindex?: boolean;
    /** Whether crawlers may still follow links out of a noindexed page. */
    follow?: boolean;
    publishedTime?: Date | string;
    modifiedTime?: Date | string;
    authors?: string[];
    section?: string;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
    const description = toDescription(opts.description);
    const image = opts.image ?? DEFAULT_OG_IMAGE;
    const type = opts.type ?? 'website';

    const metadata: Metadata = {
        title: opts.title,
        description,
        alternates: { canonical: opts.path },
        openGraph: {
            type,
            locale: 'en_US',
            siteName: SITE_NAME,
            url: opts.path,
            // OG titles get no template applied, so brand them explicitly.
            title: `${opts.title} | ${SITE_NAME}`,
            description,
            images: [image],
            ...(type === 'article'
                ? {
                      publishedTime: toIso(opts.publishedTime),
                      modifiedTime: toIso(opts.modifiedTime),
                      authors: opts.authors ?? [SITE_AUTHOR],
                      section: opts.section,
                  }
                : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${opts.title} | ${SITE_NAME}`,
            description,
            images: [image.url],
        },
    };

    if (opts.noindex) {
        const follow = opts.follow ?? true;
        metadata.robots = { index: false, follow, googleBot: { index: false, follow } };
    }

    return metadata;
}

/**
 * Metadata for pages that must stay out of the index entirely — auth-gated
 * routes, token links, and internal tools.
 *
 * Deliberately paired with a crawlable (not robots.txt-disallowed) URL: a
 * disallowed URL is never fetched, so its noindex is never seen, and it can
 * still be indexed URL-only from inbound links.
 */
export function noindexMetadata(title: string, description?: string): Metadata {
    return {
        title,
        ...(description ? { description } : {}),
        robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    };
}

function toIso(value: Date | string | undefined): string | undefined {
    if (!value) return undefined;
    return value instanceof Date ? value.toISOString() : value;
}
