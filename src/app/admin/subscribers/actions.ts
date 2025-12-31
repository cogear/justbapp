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
                zipCode: user.zipCode
            };
        });

        return subscribers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return [];
    }
}
