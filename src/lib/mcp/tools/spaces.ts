import prisma from '@/lib/prisma';

export async function listSpaces(args: { type?: string }) {
    const where = args.type ? { type: args.type as 'FEED' | 'COURSE' } : {};

    const spaces = await prisma.space.findMany({
        where,
        include: {
            _count: {
                select: { members: true, posts: true }
            }
        }
    });

    return {
        spaces: spaces.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            description: s.description,
            type: s.type,
            accessLevel: s.accessLevel,
            memberCount: s._count.members,
            postCount: s._count.posts,
        })),
        count: spaces.length
    };
}
