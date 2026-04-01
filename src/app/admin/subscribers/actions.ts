'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
    optedIn: boolean;
}

interface GetSubscribersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    showDisabled?: boolean;
    optedInOnly?: boolean;
}

interface GetSubscribersResult {
    subscribers: Subscriber[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export async function getSubscribers(params: GetSubscribersParams = {}): Promise<GetSubscribersResult> {
    const { page = 1, pageSize = 50, search, showDisabled = false, optedInOnly = false } = params;

    try {
        const where: any = {};
        if (search) {
            where.email = { contains: search, mode: 'insensitive' };
        }
        if (!showDisabled) {
            where.emailActive = true;
        }
        if (optedInOnly) {
            where.isNewsletterSubscriber = true;
        }

        const [prismaUsers, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    _count: {
                        select: { visualProfiles: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        const subscribers: Subscriber[] = prismaUsers.map(user => {
            const hasProfile = user._count.visualProfiles > 0;
            const source = ((user as any).isNewsletterSubscriber && !hasProfile) ? 'NEWSLETTER' : 'APP';

            return {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                source,
                hasProfile,
                zipCode: user.zipCode,
                emailActive: user.emailActive,
                optedIn: !!(user as any).isNewsletterSubscriber,
            };
        });

        return {
            subscribers,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
        };
    } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        return { subscribers: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function toggleSubscriberEmailStatus(userId: string, currentStatus: boolean) {
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
        revalidatePath('/admin/subscribers');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle email status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function bulkDisableSubscribers(userIds: string[]) {
    const { stackServerApp } = await import('@/lib/stack');
    const user = await stackServerApp.getUser();
    if (!user || user.primaryEmail !== 'cogear@gmail.com') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const result = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { emailActive: false }
        });
        revalidatePath('/admin/subscribers');
        return { success: true, count: result.count };
    } catch (error) {
        console.error('Failed to bulk disable subscribers:', error);
        return { success: false, error: 'Failed to disable subscribers' };
    }
}
