
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to DB...');
        await prisma.$connect();
        console.log('Successfully connected to DB!');

        // Try a simple query
        try {
            const count = await prisma.user.count();
            console.log(`User count: ${count}`);
        } catch (queryError) {
            console.error('Connected but failed to query:', queryError);
        }

    } catch (e) {
        console.error('Connection failed completely.');
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
