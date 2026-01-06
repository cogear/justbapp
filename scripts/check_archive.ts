import prisma from '@/lib/prisma';

async function checkData() {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-02-01T00:00:00Z');

    const articles = await prisma.newsArticle.findMany({
        where: {
            publishedAt: {
                gte: start,
                lt: end
            }
        },
        select: { publishedAt: true }
    });
    console.log(`Articles in Jan 2026: ${articles.length}`);
    if (articles.length > 0) {
        console.log('Sample article dates:', articles.slice(0, 3).map(a => a.publishedAt.toISOString()));
    }

    const summaries = await prisma.dailySummary.findMany({
        where: {
            date: {
                gte: start,
                lt: end
            },
            cluster: 'Global'
        }
    });
    console.log(`Global Summaries in Jan 2026: ${summaries.length}`);
    summaries.forEach(s => console.log(`- ${s.date.toISOString().split('T')[0]}: ${s.content.substring(0, 30)}...`));
}

checkData();
