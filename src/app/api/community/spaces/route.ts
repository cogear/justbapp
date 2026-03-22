import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/spaces — list all spaces
export async function GET(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // FEED or COURSE

    const where = type ? { type: type as 'FEED' | 'COURSE' } : {};

    const spaces = await prisma.space.findMany({
        where,
        include: {
            _count: { select: { members: true, posts: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
        spaces: spaces.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            description: s.description,
            type: s.type,
            accessLevel: s.accessLevel,
            memberCount: s._count.members,
            postCount: s._count.posts,
            createdAt: s.createdAt,
        })),
        count: spaces.length,
    });
}

// POST /api/community/spaces — create a space
export async function POST(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { name, slug, description, type, accessLevel } = body;

    if (!name || !slug) {
        return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.space.findUnique({ where: { slug } });
    if (existing) {
        return NextResponse.json({ error: `Space with slug "${slug}" already exists` }, { status: 409 });
    }

    const space = await prisma.space.create({
        data: {
            name,
            slug,
            description: description || null,
            type: type || 'FEED',
            accessLevel: accessLevel || 'OPEN',
        },
    });

    return NextResponse.json({ space }, { status: 201 });
}
