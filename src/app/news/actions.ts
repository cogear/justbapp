'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';

export async function trackInteraction(articleId: string, type: 'CLICK' | 'VIEW' | 'LIKE' | 'DISMISS') {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser || !stackUser.primaryEmail) return;

    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail },
        include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user || user.visualProfiles.length === 0) return;

    await prisma.userInteraction.create({
        data: {
            userId: user.visualProfiles[0].id, // Link to the specific profile used
            newsArticleId: articleId,
            type: type
        }
    });
}
