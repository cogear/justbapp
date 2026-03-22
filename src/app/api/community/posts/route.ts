import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/posts — list posts (optional ?space=slug&limit=20)
export async function GET(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const spaceSlug = searchParams.get('space');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let spaceId: string | undefined;
    if (spaceSlug) {
        const space = await prisma.space.findUnique({ where: { slug: spaceSlug } });
        if (!space) {
            return NextResponse.json({ error: `Space "${spaceSlug}" not found` }, { status: 404 });
        }
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
        },
    });

    return NextResponse.json({
        posts: posts.map((p) => ({
            id: p.id,
            content: p.content,
            author: {
                id: p.author.id,
                email: p.author.email,
                displayName: p.author.displayName,
                isPhantom: p.author.isPhantom,
            },
            space: { name: p.space.name, slug: p.space.slug },
            commentCount: p._count.comments,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        })),
        count: posts.length,
    });
}

// POST /api/community/posts — create a post
export async function POST(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { content, space_slug, author_email } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (!space_slug) {
        return NextResponse.json({ error: 'space_slug is required' }, { status: 400 });
    }
    if (!author_email) {
        return NextResponse.json({ error: 'author_email is required' }, { status: 400 });
    }

    const space = await prisma.space.findUnique({ where: { slug: space_slug } });
    if (!space) {
        return NextResponse.json({ error: `Space "${space_slug}" not found` }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { email: author_email } });
    if (!user) {
        return NextResponse.json({ error: `User "${author_email}" not found` }, { status: 404 });
    }

    // Auto-join user to space
    await prisma.spaceMember.upsert({
        where: { spaceId_userId: { spaceId: space.id, userId: user.id } },
        create: { spaceId: space.id, userId: user.id, role: 'MEMBER' },
        update: {},
    });

    const post = await prisma.post.create({
        data: { content, spaceId: space.id, authorId: user.id },
        include: { author: true, space: true },
    });

    return NextResponse.json({
        post: {
            id: post.id,
            content: post.content,
            author: post.author.displayName || post.author.email,
            space: post.space.name,
            createdAt: post.createdAt,
        },
    }, { status: 201 });
}
