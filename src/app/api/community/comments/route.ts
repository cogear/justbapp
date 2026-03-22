import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/comments?post=<post_id> — list comments for a post
export async function GET(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post');

    if (!postId) {
        return NextResponse.json({ error: 'post query parameter is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        include: {
            author: { select: { id: true, email: true, displayName: true, isPhantom: true } },
        },
    });

    return NextResponse.json({
        comments: comments.map((c) => ({
            id: c.id,
            content: c.content,
            author: {
                id: c.author.id,
                email: c.author.email,
                displayName: c.author.displayName,
                isPhantom: c.author.isPhantom,
            },
            createdAt: c.createdAt,
        })),
        count: comments.length,
    });
}

// POST /api/community/comments — create a comment
export async function POST(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { content, post_id, author_email } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (!post_id) {
        return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }
    if (!author_email) {
        return NextResponse.json({ error: 'author_email is required' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: post_id } });
    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { email: author_email } });
    if (!user) {
        return NextResponse.json({ error: `User "${author_email}" not found` }, { status: 404 });
    }

    const comment = await prisma.comment.create({
        data: { content, postId: post_id, authorId: user.id },
        include: { author: true },
    });

    return NextResponse.json({
        comment: {
            id: comment.id,
            content: comment.content,
            author: comment.author.displayName || comment.author.email,
            postId: comment.postId,
            createdAt: comment.createdAt,
        },
    }, { status: 201 });
}
