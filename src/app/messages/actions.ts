'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';
import {
    getOrCreatePairConversation,
    createConversationMessage,
} from '@/lib/messaging/conversations';
import { notifyMessageRecipients } from '@/lib/messaging/notify';

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
                displayName: stackUser.displayName || null,
            },
        });
    }

    return user;
}

/** Start (or resume) a 1:1 conversation with another member. */
export async function startConversation(otherUserId: string) {
    const user = await getOrCreateUser();
    if (!user) return { error: 'Not authenticated' };
    if (otherUserId === user.id) return { error: 'You cannot message yourself' };

    const other = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!other) return { error: 'Member not found' };

    try {
        const conversation = await getOrCreatePairConversation(user.id, otherUserId);
        return { success: true, conversationId: conversation.id };
    } catch (e) {
        console.error('Failed to start conversation:', e);
        return { error: 'Failed to start conversation' };
    }
}

/** Send a message in an existing conversation the caller belongs to. */
export async function sendMessage(conversationId: string, content: string) {
    if (!content || !content.trim()) {
        return { error: 'Message cannot be empty' };
    }
    if (content.length > 5000) {
        return { error: 'Message is too long' };
    }

    const user = await getOrCreateUser();
    if (!user) return { error: 'Not authenticated' };

    const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId: user.id } },
    });
    if (!participant) return { error: 'Conversation not found' };

    try {
        const message = await createConversationMessage({
            conversationId,
            authorId: user.id,
            content: content.trim(),
        });

        // Delivery is best-effort; the message is already durable in the DB
        try {
            await notifyMessageRecipients(message.id);
        } catch (e) {
            console.error('Message delivery fan-out failed:', e);
        }

        revalidatePath(`/messages/${conversationId}`);
        revalidatePath('/messages');
        return { success: true };
    } catch (e) {
        console.error('Failed to send message:', e);
        return { error: 'Failed to send message' };
    }
}

/** Mark a conversation read for the caller. */
export async function markConversationRead(conversationId: string) {
    const user = await getOrCreateUser();
    if (!user) return { error: 'Not authenticated' };

    try {
        await prisma.conversationParticipant.update({
            where: { conversationId_userId: { conversationId, userId: user.id } },
            data: { lastReadAt: new Date() },
        });
        return { success: true };
    } catch {
        return { error: 'Conversation not found' };
    }
}
