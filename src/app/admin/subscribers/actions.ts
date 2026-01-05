'use server';

import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';

export interface Subscriber {
    id: string;
    email: string;
    createdAt: Date;
    source: 'APP' | 'NEWSLETTER';
    hasProfile: boolean;
    zipCode?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    emailActive: boolean;
}

export async function getSubscribers(): Promise<Subscriber[]> {
    try {
        // 1. Fetch Users from Prisma with their profile count
        const prismaUsers = await prisma.user.findMany({
            include: {
                _count: {
                    select: { visualProfiles: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const subscribers: Subscriber[] = prismaUsers.map(user => {
            const hasProfile = user._count.visualProfiles > 0;

            // Logic: 
            // - If they signed up through the newsletter API, isNewsletterSubscriber is true.
            // - If they signed up through Stack and did profiling, they are APP.
            // - If they are ONLY a newsletter subscriber (no profile and isNewsletterSubscriber is true), source is NEWSLETTER.
            // - Otherwise, default to APP (as they are in our User table).
            const source = ((user as any).isNewsletterSubscriber && !hasProfile) ? 'NEWSLETTER' : 'APP';

            return {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                source,
                hasProfile,
                zipCode: user.zipCode,
                emailActive: user.emailActive
            };
        });

        return subscribers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return [];
    }
}

export async function toggleSubscriberEmailStatus(userId: string, currentStatus: boolean) {
    'use server';

    // Admin-only check
    const { stackServerApp } = await import('@/lib/stack');
    const user = await stackServerApp.getUser();
    if (!user || user.primaryEmail !== 'cogear@gmail.com') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { emailActive: !currentStatus }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to toggle email status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}
