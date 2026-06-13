import 'server-only';
import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/messaging/sms';
import { SMS_TEMPLATES } from '@/lib/messaging/sms-templates';
import { createConversationMessage } from '@/lib/messaging/conversations';
import { notifyMessageRecipients } from '@/lib/messaging/notify';
import type { Prisma } from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';
const ROUTING_WINDOW_HOURS = 72;

const STOP_WORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit']);

/**
 * Route an inbound SMS reply to the right conversation.
 *
 * Sent is template-only, so we can't text back a free-form numeric picker.
 * Heuristic (sender phone is all we have):
 *   1. STOP keyword  → suppress and stop (Sent also auto-suppresses)
 *   2. Exactly one conversation with an SMS notification in the last 72h → route the reply into it
 *   3. Zero or several → point them back to the app (openApp template)
 */
export async function routeInboundSms({
    fromPhone,
    toNumber,
    body,
    providerId,
    rawPayload,
}: {
    fromPhone: string;
    toNumber: string;
    body: string;
    providerId: string;
    rawPayload: Prisma.InputJsonValue;
}) {
    const text = body.trim();

    const log = async (
        status: 'MATCHED' | 'UNMATCHED' | 'REJECTED',
        extras: { parsedText?: string; messageId?: string } = {}
    ) =>
        prisma.inboundMessage.create({
            data: {
                channel: 'SMS',
                fromAddress: fromPhone,
                toAddress: toNumber,
                providerId,
                rawPayload,
                parsedText: extras.parsedText,
                messageId: extras.messageId,
                status,
            },
        });

    const openApp = () =>
        sendSms(fromPhone, { template: SMS_TEMPLATES.openApp, variables: { var_1: `${SITE_URL}/messages` } });

    // 1. STOP — belt-and-braces alongside Sent's automatic opt-out handling
    if (STOP_WORDS.has(text.toLowerCase())) {
        await prisma.contactSuppression
            .upsert({
                where: { identifier: fromPhone },
                create: { identifier: fromPhone, channel: 'SMS', reason: 'STOP' },
                update: { reason: 'STOP' },
            })
            .catch(() => {});
        await prisma.user
            .updateMany({ where: { phone: fromPhone }, data: { smsActive: false } })
            .catch(() => {});
        await log('REJECTED', { parsedText: text });
        return;
    }

    const user = await prisma.user.findUnique({ where: { phone: fromPhone } });
    if (!user) {
        // Unknown number: log it, stay silent (don't text strangers)
        await log('UNMATCHED', { parsedText: text });
        return;
    }

    // 2. Candidate conversations: SMS notifications sent to this user in the window
    const recentDeliveries = await prisma.messageDelivery.findMany({
        where: {
            recipientId: user.id,
            channel: 'SMS',
            status: { in: ['SENT', 'DELIVERED'] },
            createdAt: { gt: new Date(Date.now() - ROUTING_WINDOW_HOURS * 60 * 60 * 1000) },
            message: { conversationId: { not: null } },
        },
        orderBy: { createdAt: 'desc' },
        include: { message: { select: { conversationId: true } } },
    });

    const conversationIds = [
        ...new Set(recentDeliveries.map((d) => d.message.conversationId).filter(Boolean) as string[]),
    ];

    // 3a. Nothing to route to → point them to the app
    if (conversationIds.length === 0) {
        await log('UNMATCHED', { parsedText: text });
        await openApp();
        return;
    }

    // 2 (cont). Exactly one — route the reply straight into that conversation
    if (conversationIds.length === 1) {
        const message = await createConversationMessage({
            conversationId: conversationIds[0],
            authorId: user.id,
            content: text,
            sourceChannel: 'SMS',
        });
        await log('MATCHED', { parsedText: text, messageId: message.id });
        try {
            await notifyMessageRecipients(message.id);
        } catch (e) {
            console.error('SMS reply fan-out failed:', e);
        }
        return;
    }

    // 3b. Several active chats — we can't disambiguate over a templated channel,
    //     so send them to the app to choose the thread.
    await log('UNMATCHED', { parsedText: text });
    await openApp();
}
