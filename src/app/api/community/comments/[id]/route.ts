import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// PUT /api/community/comments/:id — update a comment
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

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = await prisma.comment.update({
        where: { id },
        data: { content },
    });

    return NextResponse.json({ comment });
}

// DELETE /api/community/comments/:id — delete a comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
