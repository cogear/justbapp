import prisma from '../prisma.js';
import { phantomPersonas } from '../data/phantom-personas.js';

export async function createPhantomUser(args: { name: string; email: string; personality?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: args.email } });
    if (existing) {
        return { success: false, message: `User with email ${args.email} already exists`, user: existing };
    }

    const user = await prisma.user.create({
        data: {
            email: args.email,
            displayName: args.name,
            isPhantom: true,
            psychographicProfile: args.personality || null,
        }
    });

    return { success: true, user };
}

export async function seedAllPhantomUsers() {
    const results = [];
    for (const persona of phantomPersonas) {
        const result = await createPhantomUser({
            name: persona.name,
            email: persona.email,
            personality: persona.personality,
        });
        results.push(result);
    }
    return results;
}

export async function listUsers(args: { phantoms_only?: boolean; limit?: number }) {
    const limit = args.limit || 50;

    const where = args.phantoms_only ? { isPhantom: true } : {};

    const users = await prisma.user.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            displayName: true,
            isPhantom: true,
            psychographicProfile: true,
            createdAt: true,
        }
    });

    return { users, count: users.length };
}
