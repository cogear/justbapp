import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = (() => {
    // In development, always return a new client to pick up schema changes immediately.
    // Turbopack's aggressive caching can otherwise keep a stale client instance.
    if (process.env.NODE_ENV !== 'production') {
        return prismaClientSingleton();
    }

    return globalThis.prisma ?? prismaClientSingleton();
})();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
