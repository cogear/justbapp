import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');

    // Simple API key check
    const expectedKey = process.env.NEWSLETTER_API_KEY;
    if (expectedKey && apiKey !== expectedKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const articles = await prisma.newsArticle.findMany({
            orderBy: { publishedAt: 'desc' },
            take: 10,
            include: {
                reframedArticles: true
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theblife.com';

        const result = articles.map(article => ({
            id: article.id,
            originalTitle: article.title,
            originalUrl: article.originalUrl,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt.toISOString(),
            source: article.source,
            lenses: article.reframedArticles.map(reframe => ({
                cluster: reframe.cluster,
                headline: reframe.headline,
                summary: reframe.summary,
                lensUrl: `${baseUrl}/lens/${article.id}?cluster=${encodeURIComponent(reframe.cluster)}`
            }))
        }));

        return NextResponse.json({ articles: result });
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
