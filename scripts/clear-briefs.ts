
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Clearing daily summaries for ${today.toISOString()}...`);

    const result = await prisma.dailySummary.deleteMany({
        where: {
            date: today
        }
    });

    console.log(`Deleted ${result.count} summaries.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
