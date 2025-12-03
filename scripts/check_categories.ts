
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Checking event categories...');
    try {
        const categoryCounts = await prisma.event.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
            orderBy: {
                _count: {
                    category: 'desc',
                },
            },
        });

        console.log('Category Counts:');
        categoryCounts.forEach((c) => {
            console.log(`${c.category}: ${c._count.category}`);
        });
    } catch (error) {
        console.error('Error checking categories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
