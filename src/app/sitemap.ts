import type { MetadataRoute } from 'next';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
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

    // Only public courses that actually have content. The `courses.some(...)`
    // clause keeps demo or half-seeded spaces out on its own.
    const spaces = await prisma.space.findMany({
        where: {
            type: 'COURSE',
            accessLevel: 'OPEN',
            courses: { some: { modules: { some: { lessons: { some: {} } } } } },
        },
        select: { slug: true, updatedAt: true },
        orderBy: { createdAt: 'asc' },
    });

    const coursePages: MetadataRoute.Sitemap = spaces.map(space => ({
        url: absoluteUrl(`/community/${space.slug}`),
        lastModified: space.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...coursePages, ...(await productPages())];
}
