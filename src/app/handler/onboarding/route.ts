
import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const user = await stackServerApp.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Find Prisma user by email
    const prismaUser = await prisma.user.findUnique({
        where: { email: user.primaryEmail || '' },
        include: { visualProfiles: true }
    });

    if (prismaUser && prismaUser.visualProfiles.length > 0) {
        return NextResponse.redirect(new URL('/news', request.url));
    } else {
        return NextResponse.redirect(new URL('/visual-profile', request.url));
    }
}
