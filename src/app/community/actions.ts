'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';

async function getOrCreateUser() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) return null;

    let user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: stackUser.primaryEmail || '',
            },
        });
    }

    return user;
}

export async function createPost(content: string, spaceId: string) {
    if (!content || !content.trim()) {
        return { error: 'Content cannot be empty' };
    }

    const user = await getOrCreateUser();
    if (!user) {
        return { error: 'Not authenticated' };
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

export async function toggleLike(postId: string) {
    const user = await getOrCreateUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        const existing = await prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        });

        if (existing) {
            await prisma.postLike.delete({
                where: { id: existing.id },
            });
            revalidatePath('/community');
            return { liked: false };
        } else {
            await prisma.postLike.create({
                data: { postId, userId: user.id },
            });
            revalidatePath('/community');
            return { liked: true };
        }
    } catch (e) {
        console.error('Failed to toggle like:', e);
        return { error: 'Failed to toggle like' };
    }
}

export async function createComment(content: string, postId: string) {
    if (!content || !content.trim()) {
        return { error: 'Content cannot be empty' };
    }

    const user = await getOrCreateUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: user.id,
            },
        });

        revalidatePath(`/community`);
        return { success: true };
    } catch (e) {
        console.error('Failed to create comment:', e);
        return { error: 'Failed to create comment' };
    }
}

export async function createLessonComment(content: string, lessonId: string) {
    if (!content || !content.trim()) {
        return { error: 'Content cannot be empty' };
    }

    const user = await getOrCreateUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        await prisma.comment.create({
            data: {
                content,
                lessonId,
                authorId: user.id,
            },
        });

        revalidatePath('/community/[spaceSlug]', 'page');
        return { success: true };
    } catch (e) {
        console.error('Failed to create lesson comment:', e);
        return { error: 'Failed to create comment' };
    }
}

export async function getLessonComments(lessonId: string) {
    const stackUser = await stackServerApp.getUser();

    const comments = await prisma.comment.findMany({
        where: { lessonId },
        include: {
            author: { select: { displayName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    return {
        comments: comments.map(c => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            author: c.author,
        })),
        isAuthenticated: !!stackUser,
    };
}
