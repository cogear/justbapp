'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string, spaceId: string) {
    if (!content || !content.trim()) {
        return { error: 'Content cannot be empty' };
    }

    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
        return { error: 'Not authenticated' };
    }

    // Find or create user in our database (sync with Stack)
    // Note: In a real app, you might want to sync this via webhook or middleware
    // But for now, lazy sync on action is fine.
    let user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: stackUser.primaryEmail || '',
                // You might want to grab name/image from stackUser if available
            },
        });
    }

    try {
        await prisma.post.create({
            data: {
                content,
                spaceId,
                authorId: user.id,
            },
        });

        revalidatePath(`/community`);
        return { success: true };
    } catch (e) {
        console.error('Failed to create post:', e);
        return { error: 'Failed to create post' };
    }
}
