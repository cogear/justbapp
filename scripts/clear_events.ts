
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing all events...');
    try {
        const { count } = await prisma.event.deleteMany({});
        console.log(`Deleted ${count} events.`);
    } catch (error) {
        console.error('Error deleting events:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
