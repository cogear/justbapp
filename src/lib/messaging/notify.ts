import 'server-only';
import prisma from '@/lib/prisma';
import { sendEmail, maskedFrom, replyAddress } from '@/lib/messaging/email';
import { DirectMessageEmail } from '@/emails/DirectMessageEmail';
import * as React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';

/**
 * Fan a conversation message out to every participant except the author,
 * via each recipient's enabled channels. Failures are non-fatal: the message
 * is already durable in the DB and visible at /messages.
 */
export async function notifyMessageRecipients(messageId: string) {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
            author: { select: { id: true, displayName: true, email: true } },
            conversation: {
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    emailActive: true,
                                    isPhantom: true,
                                    notificationPreference: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!message?.conversation) return;

    const senderName = message.author.displayName || 'A member';
    const recipients = message.conversation.participants.filter(
        (p) => p.userId !== message.authorId
    );

    for (const participant of recipients) {
        const { user } = participant;

        // Email channel — default ON for DMs unless prefs say otherwise
        const wantsEmail = user.notificationPreference?.dmEmail ?? true;
        if (!wantsEmail || !user.emailActive || user.isPhantom) {
            await prisma.messageDelivery.create({
                data: {
                    messageId: message.id,
                    recipientId: user.id,
                    channel: 'EMAIL',
                    status: 'SKIPPED',
                },
            });
            continue;
        }

        const delivery = await prisma.messageDelivery.create({
            data: {
                messageId: message.id,
                recipientId: user.id,
                channel: 'EMAIL',
                status: 'QUEUED',
            },
        });

        try {
            const result = await sendEmail({
                to: user.email,
                from: maskedFrom(senderName),
                replyTo: replyAddress(participant.replyToken),
                subject: `${senderName} sent you a message`,
                react: React.createElement(DirectMessageEmail, {
                    senderName,
                    messageText: message.content,
                    conversationUrl: `${SITE_URL}/messages/${message.conversationId}`,
                }),
            });

            await prisma.messageDelivery.update({
                where: { id: delivery.id },
                data:
                    'id' in result
                        ? { status: 'SENT', providerMessageId: result.id }
                        : { status: 'FAILED', error: result.error },
            });
        } catch (e) {
            console.error('Failed to deliver message email:', e);
            await prisma.messageDelivery
                .update({
                    where: { id: delivery.id },
                    data: { status: 'FAILED', error: e instanceof Error ? e.message : 'unknown' },
                })
                .catch(() => {});
        }
    }
}
