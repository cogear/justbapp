
import { generateDailyEssence } from '../src/lib/news/summary';
import prisma from '../src/lib/prisma';

async function backfill() {
    console.log('Starting backfill for Global summaries (Jan 1, 2026 - Today)...');

    const startDate = new Date('2026-01-01T00:00:00Z');
    const endDate = new Date(); // now

    // Iterate day by day
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Processing ${dateStr}...`);

        try {
            // Check if summary already exists
            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);

            const existing = await prisma.dailySummary.findFirst({
                where: {
                    date: startOfDay,
                    cluster: 'Global'
                }
            });

            if (existing) {
                console.log(`Summary already exists for ${dateStr}. Skipping.`);
                continue;
            }

            console.log(`Generating summary for ${dateStr}...`);
            const summary = await generateDailyEssence(d, "Global");

            if (summary) {
                console.log(`Successfully generated summary for ${dateStr} (ID: ${summary.id})`);
            } else {
                console.log(`No articles found for ${dateStr}, or generation failed.`);
            }

        } catch (error) {
            console.error(`Error processing ${dateStr}:`, error);
        }
    }

    console.log('Backfill complete.');
}

backfill()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
