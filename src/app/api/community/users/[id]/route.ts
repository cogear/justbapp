import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/users/:id — get a single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            displayName: true,
            isPhantom: true,
            psychographicProfile: true,
            createdAt: true,
            _count: { select: { posts: true, comments: true } },
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isPhantom: user.isPhantom,
        psychographicProfile: user.psychographicProfile,
        postCount: user._count.posts,
        commentCount: user._count.comments,
        createdAt: user.createdAt,
    });
}

// PUT /api/community/users/:id — update a user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { displayName, psychographicProfile } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            ...(displayName !== undefined && { displayName }),
            ...(psychographicProfile !== undefined && { psychographicProfile }),
        },
    });

    return NextResponse.json({ user });
}

// DELETE /api/community/users/:id — delete a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
