import 'server-only';
import prisma from '@/lib/prisma';
import type { MessageChannel } from '@prisma/client';

/** Deterministic key for a 1:1 conversation — sorted so (A,B) === (B,A). */
export function pairKey(userIdA: string, userIdB: string) {
    return [userIdA, userIdB].sort().join(':');
}

/**
 * Find or create the 1:1 conversation between two users.
 * Race-safe via the unique constraint on pairKey.
 */
export async function getOrCreatePairConversation(userIdA: string, userIdB: string) {
    const key = pairKey(userIdA, userIdB);

    const existing = await prisma.conversation.findUnique({
        where: { pairKey: key },
    });
    if (existing) return existing;

    try {
        return await prisma.conversation.create({
            data: {
                pairKey: key,
                participants: {
                    create: [{ userId: userIdA }, { userId: userIdB }],
                },
            },
        });
    } catch {
        // Unique violation: another request created it first
        const conversation = await prisma.conversation.findUnique({
            where: { pairKey: key },
        });
        if (!conversation) throw new Error('Failed to create conversation');
        return conversation;
    }
}

/** Create a message in a conversation and bump its lastMessageAt. */
export async function createConversationMessage({
    conversationId,
    authorId,
    content,
    sourceChannel = 'APP',
}: {
    conversationId: string;
    authorId: string;
    content: string;
    sourceChannel?: MessageChannel;
}) {
    const [message] = await prisma.$transaction([
        prisma.message.create({
            data: { conversationId, authorId, content, sourceChannel },
        }),
        prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        }),
    ]);
    return message;
}
