import { generateDailyEssence } from '../src/lib/news/summary';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Generating daily summary...');
    try {
        const summary = await generateDailyEssence();
        if (summary) {
            console.log('Summary generated:', summary);
        } else {
            console.log('No summary generated (possibly no news articles).');
        }
    } catch (error) {
        console.error('Error generating summary:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
