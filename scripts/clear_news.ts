
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing News database...');

    // Delete interactions first (foreign key constraint)
    const interactions = await prisma.userInteraction.deleteMany({});
    console.log(`Deleted ${interactions.count} interactions.`);

    // Delete reframes (foreign key constraint)
    const reframes = await prisma.reframedArticle.deleteMany({});
    console.log(`Deleted ${reframes.count} reframes.`);

    // Delete articles
    const articles = await prisma.newsArticle.deleteMany({});
    console.log(`Deleted ${articles.count} articles.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
