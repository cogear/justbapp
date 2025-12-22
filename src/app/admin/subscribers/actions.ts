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
        // 1. Fetch Users from Prisma
        const prismaUsers = await prisma.user.findMany({
            include: {
                visualProfiles: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const appSubscribers: Subscriber[] = prismaUsers.map(user => ({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            source: 'APP',
            hasProfile: user.visualProfiles.length > 0,
            zipCode: user.zipCode
        }));

        // 2. Try to fetch from Resend (Newsletter)
        // Note: Without an audienceId, we might just get all contacts or have to skip.
        // For now, let's just use Prisma as the primary source of truth for the "App" 
        // and later we can integrate Resend Audience listing if configured.

        let newsletterSubscribers: Subscriber[] = [];

        /* 
        try {
            // This requires RESEND_AUDIENCE_ID to be set in env
            const audienceId = process.env.RESEND_AUDIENCE_ID;
            if (audienceId) {
                const { data, error } = await resend.contacts.list({ audienceId });
                if (data && !error) {
                    newsletterSubscribers = data.data.map(contact => ({
                        id: contact.id,
                        email: contact.email,
                        createdAt: new Date(contact.created_at),
                        source: 'NEWSLETTER',
                        hasProfile: false, // Newsletter only subs haven't done profiling
                        firstName: contact.first_name,
                        lastName: contact.last_name
                    }));
                }
            }
        } catch (e) {
            console.warn('Failed to fetch Resend contacts:', e);
        }
        */

        // Combine and dedup by email (App User takes precedence)
        const combined = [...appSubscribers];
        const seenEmails = new Set(appSubscribers.map(s => s.email.toLowerCase()));

        for (const sub of newsletterSubscribers) {
            if (!seenEmails.has(sub.email.toLowerCase())) {
                combined.push(sub);
                seenEmails.add(sub.email.toLowerCase());
            }
        }

        return combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return [];
    }
}
