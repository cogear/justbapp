import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/posts/:id — get a single post with comments
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, email: true, displayName: true, isPhantom: true } },
            space: { select: { name: true, slug: true } },
            comments: {
                include: { author: { select: { id: true, email: true, displayName: true } } },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: post.id,
        content: post.content,
        author: {
            id: post.author.id,
            email: post.author.email,
            displayName: post.author.displayName,
            isPhantom: post.author.isPhantom,
        },
        space: { name: post.space.name, slug: post.space.slug },
        comments: post.comments.map((c) => ({
            id: c.id,
            content: c.content,
            author: { id: c.author.id, email: c.author.email, displayName: c.author.displayName },
            createdAt: c.createdAt,
        })),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    });
}

// PUT /api/community/posts/:id — update a post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await prisma.post.update({
        where: { id },
        data: { content },
    });

    return NextResponse.json({ post });
}

// DELETE /api/community/posts/:id — delete a post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
