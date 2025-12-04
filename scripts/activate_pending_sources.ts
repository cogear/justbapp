
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Activating all PENDING sources...');

    const result = await prisma.eventSource.updateMany({
        where: {
            status: 'PENDING',
        },
        data: {
            status: 'ACTIVE',
        },
    });

    console.log(`Updated ${result.count} sources to ACTIVE.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
