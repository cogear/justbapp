import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = (() => {
    const existing = globalThis.prisma;
    // If we're in development and the newsletter model is missing (stale client), force a recreate
    if (process.env.NODE_ENV !== 'production' && existing && !('newsletter' in existing)) {
        console.log('Newsletter model missing in Prisma client, recreating...');
        return prismaClientSingleton();
    }
    return existing ?? prismaClientSingleton();
})();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
