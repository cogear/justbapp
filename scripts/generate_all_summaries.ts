import { generateAllDailySummaries } from '../src/lib/news/summary';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Generating daily summaries for all clusters...');
    try {
        const results = await generateAllDailySummaries();
        console.log(`Generated ${results.length} summaries.`);
        results.forEach(s => {
            if (s) console.log(`- ${s.cluster}: ${s.content.substring(0, 50)}...`);
        });
    } catch (error) {
        console.error('Error generating summaries:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
