import prisma from '@/lib/prisma';

export async function createPost(args: { content: string; space_slug: string; author_email: string }) {
    const space = await prisma.space.findUnique({ where: { slug: args.space_slug } });
    if (!space) {
        return { success: false, message: `Space with slug "${args.space_slug}" not found` };
    }

    const user = await prisma.user.findUnique({ where: { email: args.author_email } });
    if (!user) {
        return { success: false, message: `User with email "${args.author_email}" not found` };
    }

    await prisma.spaceMember.upsert({
        where: { spaceId_userId: { spaceId: space.id, userId: user.id } },
        create: { spaceId: space.id, userId: user.id, role: 'MEMBER' },
        update: {},
    });

    const post = await prisma.post.create({
        data: { content: args.content, spaceId: space.id, authorId: user.id },
        include: { author: true, space: true }
    });

    return {
        success: true,
        post: {
            id: post.id,
            content: post.content,
            author: post.author.displayName || post.author.email,
            space: post.space.name,
            createdAt: post.createdAt,
        }
    };
}

export async function listPosts(args: { space_slug?: string; limit?: number }) {
    const limit = args.limit || 20;
    let spaceId: string | undefined;

    if (args.space_slug) {
        const space = await prisma.space.findUnique({ where: { slug: args.space_slug } });
        if (!space) return { success: false, message: `Space "${args.space_slug}" not found` };
        spaceId = space.id;
    }

    const posts = await prisma.post.findMany({
        where: spaceId ? { spaceId } : {},
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { id: true, email: true, displayName: true, isPhantom: true } },
            space: { select: { name: true, slug: true } },
            _count: { select: { comments: true } },
        }
    });

    return {
        posts: posts.map((p: any) => ({
            id: p.id,
            content: p.content.substring(0, 200) + (p.content.length > 200 ? '...' : ''),
            author: p.author.displayName || p.author.email,
            authorEmail: p.author.email,
            isPhantom: p.author.isPhantom,
            space: p.space.name,
            spaceSlug: p.space.slug,
            commentCount: p._count.comments,
            createdAt: p.createdAt,
        })),
        count: posts.length
    };
}
