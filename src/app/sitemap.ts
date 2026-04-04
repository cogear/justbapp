import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://theblife.com';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${baseUrl}/principles`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/book`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Community spaces
    const spaces = await prisma.space.findMany({
        select: { slug: true, updatedAt: true },
    });
    const spacePages: MetadataRoute.Sitemap = spaces.map(space => ({
        url: `${baseUrl}/community/${space.slug}`,
        lastModified: space.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    // Course lessons (the main content)
    const lessons = await prisma.lesson.findMany({
        select: {
            id: true,
            updatedAt: true,
            module: {
                select: {
                    id: true,
                    course: {
                        select: {
                            space: { select: { slug: true } },
                        },
                    },
                },
            },
        },
    });
    const lessonPages: MetadataRoute.Sitemap = lessons.map(lesson => ({
        url: `${baseUrl}/community/${lesson.module.course.space.slug}?module=${lesson.module.id}&lesson=${lesson.id}`,
        lastModified: lesson.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
    }));

    // News articles
    const articles = await prisma.newsArticle.findMany({
        select: { id: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 100,
    });
    const articlePages: MetadataRoute.Sitemap = articles.map(article => ({
        url: `${baseUrl}/news/${article.id}`,
        lastModified: article.publishedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
    }));

    return [...staticPages, ...spacePages, ...lessonPages, ...articlePages];
}
