import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.newsArticle.count();
    console.log(`NewsArticle count: ${count}`);

    const summaries = await prisma.dailySummary.findMany();
    console.log(`DailySummary count: ${summaries.length}`);
    if (summaries.length > 0) {
        console.log('Last summary:', summaries[0]);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
