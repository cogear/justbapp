import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all event sources...');
    try {
        const { count } = await prisma.eventSource.deleteMany({});
        console.log(`Deleted ${count} event sources.`);
    } catch (error) {
        console.error('Error deleting sources:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
