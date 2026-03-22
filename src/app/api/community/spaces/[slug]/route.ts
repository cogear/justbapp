import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/spaces/:slug — get a single space
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { slug } = await params;
    const space = await prisma.space.findUnique({
        where: { slug },
        include: {
            _count: { select: { members: true, posts: true } },
        },
    });

    if (!space) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: space.id,
        name: space.name,
        slug: space.slug,
        description: space.description,
        type: space.type,
        accessLevel: space.accessLevel,
        memberCount: space._count.members,
        postCount: space._count.posts,
        createdAt: space.createdAt,
    });
}

// PUT /api/community/spaces/:slug — update a space
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { slug } = await params;
    const body = await request.json();
    const { name, description, type, accessLevel } = body;

    const existing = await prisma.space.findUnique({ where: { slug } });
    if (!existing) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const space = await prisma.space.update({
        where: { slug },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(type !== undefined && { type }),
            ...(accessLevel !== undefined && { accessLevel }),
        },
    });

    return NextResponse.json({ space });
}

// DELETE /api/community/spaces/:slug — delete a space
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!authenticate(request)) return unauthorized();

    const { slug } = await params;
    const existing = await prisma.space.findUnique({ where: { slug } });
    if (!existing) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    await prisma.space.delete({ where: { slug } });

    return NextResponse.json({ success: true });
}
