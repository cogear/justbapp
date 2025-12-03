
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { categorizeEvent } from '../src/lib/events/ingestion';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Classifying existing events...');
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                category: true
            }
        });

        console.log(`Found ${events.length} events.`);

        let updatedCount = 0;
        for (const event of events) {
            const newCategory = categorizeEvent(event.title, event.description);

            if (newCategory !== event.category && newCategory !== 'Community') {
                await prisma.event.update({
                    where: { id: event.id },
                    data: { category: newCategory }
                });
                updatedCount++;
                process.stdout.write('+');
            } else {
                process.stdout.write('.');
            }
        }

        console.log(`\nUpdated ${updatedCount} events with new categories.`);

    } catch (error) {
        console.error('Error classifying events:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
