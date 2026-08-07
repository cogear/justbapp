import type { MetadataRoute } from 'next';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getAllCoursePaths } from '@/lib/courses/queries';
import { coursePath, lessonPath, modulePath } from '@/lib/courses/paths';
import { absoluteUrl } from '@/lib/seo';

/**
 * Refresh daily without a redeploy. Without this the sitemap is generated once
 * at build time and frozen — new courses and lessons stay invisible until the
 * next deploy.
 */
export const revalidate = 86400;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/**
 * Deliberately excluded, and why:
 *   /news, /news/{id} — AI reframings of third-party reporting; /news also
 *                       redirects anonymous visitors to /sign-in.
 *   /gatherings, /getout — both redirect anonymous visitors to /sign-in, and a
 *                          redirecting URL in a sitemap is a GSC error.
 *   FEED spaces (general, introductions) — thin member-generated content.
 */
const STATIC_PAGES: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/principles', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/community', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/book', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
    { path: '/blog/archive', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/events', changeFrequency: 'daily', priority: 0.7 },
    { path: '/subscribe', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/sms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

const LANDERS_DIR = path.join(process.cwd(), 'src/data/landers');

async function productPages(): Promise<MetadataRoute.Sitemap> {
    try {
        const files = await readdir(LANDERS_DIR);
        return Promise.all(
            files
                .filter(f => f.endsWith('.json'))
                .map(async f => {
                    const { mtime } = await stat(path.join(LANDERS_DIR, f));
                    return {
                        url: absoluteUrl(`/products/${f.replace(/\.json$/, '')}`),
                        lastModified: mtime,
                        changeFrequency: 'monthly' as const,
                        priority: 0.6,
                    };
                })
        );
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages carry no lastModified. Stamping them with `new Date()` (as
    // this file used to) claims /privacy and /terms change on every build, which
    // teaches Google to distrust every lastmod we publish.
    const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
        url: absoluteUrl(page.path),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
    }));

    // One query for the whole course tree — public courses with content only.
    // The has-lessons clause keeps demo or half-seeded spaces out on its own,
    // without needing a hardcoded exclusion list.
    const paths = await getAllCoursePaths();

    // A space appears once per module, so dedupe to one landing entry each.
    const seenSpaces = new Map<string, Date>();
    for (const p of paths) {
        if (!seenSpaces.has(p.spaceSlug)) seenSpaces.set(p.spaceSlug, p.spaceUpdatedAt);
    }

    const landingPages: MetadataRoute.Sitemap = [...seenSpaces].map(([slug, updatedAt]) => ({
        url: absoluteUrl(coursePath(slug)),
        lastModified: updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Every entry carries its own row's updatedAt rather than a shared build
    // timestamp — a lastmod that is obviously wrong teaches Google to ignore
    // all of them.
    const modulePages: MetadataRoute.Sitemap = paths.map(p => ({
        url: absoluteUrl(modulePath(p.spaceSlug, p.moduleSlug)),
        lastModified: p.moduleUpdatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    const lessonPages: MetadataRoute.Sitemap = paths.flatMap(p =>
        p.lessons.map(lesson => ({
            url: absoluteUrl(lessonPath(p.spaceSlug, p.moduleSlug, lesson.slug)),
            lastModified: lesson.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        }))
    );

    // ~610 URLs. The limits are 50,000 URLs and 50MB uncompressed per file, so
    // there is no need for a sitemap index here. Past ~10,000 lessons, switch to
    // Next's generateSitemaps() in this file — it shards to /sitemap/[id].xml
    // and emits the index automatically. Nothing in this shape blocks that.
    return [
        ...staticPages,
        ...landingPages,
        ...modulePages,
        ...lessonPages,
        ...(await productPages()),
    ];
}
