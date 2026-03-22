import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, unauthorized } from '@/lib/api-auth';

// GET /api/community/users — list users (optional ?phantoms_only=true&limit=50)
export async function GET(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const phantomsOnly = searchParams.get('phantoms_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where = phantomsOnly ? { isPhantom: true } : {};

    const users = await prisma.user.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            displayName: true,
            isPhantom: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ users, count: users.length });
}

// POST /api/community/users — create a user (phantom or regular)
export async function POST(request: NextRequest) {
    if (!authenticate(request)) return unauthorized();

    const body = await request.json();
    const { email, displayName, isPhantom, psychographicProfile } = body;

    if (!email) {
        return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: `User with email "${email}" already exists` }, { status: 409 });
    }

    const user = await prisma.user.create({
        data: {
            email,
            displayName: displayName || null,
            isPhantom: isPhantom || false,
            psychographicProfile: psychographicProfile || null,
        },
    });

    return NextResponse.json({ user }, { status: 201 });
}
