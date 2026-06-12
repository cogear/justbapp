import 'server-only';
import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/messaging/sms';
import { createConversationMessage } from '@/lib/messaging/conversations';
import { notifyMessageRecipients } from '@/lib/messaging/notify';
import type { Prisma } from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';
const ROUTING_WINDOW_HOURS = 72;
const DISAMBIGUATION_WINDOW_MS = 60 * 60 * 1000;

const STOP_WORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit']);

type DisambiguationOption = { index: number; conversationId: string; label: string };

/**
 * Route an inbound SMS to the right conversation.
 *
 * Heuristic (single origination number — sender phone is all we have):
 *   1. STOP keywords → suppress and stop
 *   2. Numeric reply within 1h of a picker → resolve pending disambiguation
 *   3. Exactly one conversation with SMS deliveries in the last 72h → route
 *   4. None → text them a link to /messages
 *   5. Several → text a numeric picker, park as NEEDS_DISAMBIGUATION
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
        status: 'MATCHED' | 'UNMATCHED' | 'NEEDS_DISAMBIGUATION' | 'REJECTED',
        extras: { parsedText?: string; messageId?: string; payload?: Prisma.InputJsonValue } = {}
    ) =>
        prisma.inboundMessage.create({
            data: {
                channel: 'SMS',
                fromAddress: fromPhone,
                toAddress: toNumber,
                providerId,
                rawPayload: extras.payload ?? rawPayload,
                parsedText: extras.parsedText,
                messageId: extras.messageId,
                status,
            },
        });

    // 1. STOP — belt-and-braces alongside AWS-managed keywords
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

    // 2. Numeric reply → pending picker?
    if (/^[1-9]$/.test(text)) {
        const pending = await prisma.inboundMessage.findFirst({
            where: {
                channel: 'SMS',
                fromAddress: fromPhone,
                status: 'NEEDS_DISAMBIGUATION',
                createdAt: { gt: new Date(Date.now() - DISAMBIGUATION_WINDOW_MS) },
            },
            orderBy: { createdAt: 'desc' },
        });

        const options =
            pending && typeof pending.rawPayload === 'object' && pending.rawPayload !== null
                ? ((pending.rawPayload as { _disambiguation?: DisambiguationOption[] })
                      ._disambiguation ?? null)
                : null;
        const choice = options?.find((option) => option.index === Number(text));

        if (pending && choice) {
            // The picker held the *original* reply text; deliver it now
            const originalText = pending.parsedText || '';
            const message = await createConversationMessage({
                conversationId: choice.conversationId,
                authorId: user.id,
                content: originalText,
                sourceChannel: 'SMS',
            });
            await prisma.inboundMessage.update({
                where: { id: pending.id },
                data: { status: 'MATCHED', messageId: message.id },
            });
            await log('MATCHED', { parsedText: text, messageId: message.id });
            try {
                await notifyMessageRecipients(message.id);
            } catch (e) {
                console.error('SMS disambiguation fan-out failed:', e);
            }
            return;
        }
        // No pending picker — fall through and treat the digit as a normal reply
    }

    // 3. Candidate conversations: SMS deliveries to this user in the window
    const recentDeliveries = await prisma.messageDelivery.findMany({
        where: {
            recipientId: user.id,
            channel: 'SMS',
            status: { in: ['SENT', 'DELIVERED'] },
            createdAt: { gt: new Date(Date.now() - ROUTING_WINDOW_HOURS * 60 * 60 * 1000) },
            message: { conversationId: { not: null } },
        },
        orderBy: { createdAt: 'desc' },
        include: {
            message: {
                select: {
                    conversationId: true,
                    conversation: {
                        select: {
                            participants: {
                                select: {
                                    userId: true,
                                    user: { select: { displayName: true, email: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const byConversation = new Map<string, { label: string }>();
    for (const delivery of recentDeliveries) {
        const conversationId = delivery.message.conversationId!;
        if (byConversation.has(conversationId)) continue;
        const other = delivery.message.conversation?.participants.find(
            (p) => p.userId !== user.id
        );
        byConversation.set(conversationId, {
            label: other?.user.displayName || other?.user.email?.split('@')[0] || 'Member',
        });
    }
    const candidates = [...byConversation.entries()];

    // 4. Nothing to route to
    if (candidates.length === 0) {
        await log('UNMATCHED', { parsedText: text });
        await sendSms(
            fromPhone,
            `The B Life: we couldn't match your reply to a conversation. View your messages: ${SITE_URL}/messages`
        );
        return;
    }

    // 3 (cont). Exactly one — route it
    if (candidates.length === 1) {
        const [conversationId] = candidates[0];
        const message = await createConversationMessage({
            conversationId,
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

    // 5. Ambiguous — send a picker and park the reply text
    const options: DisambiguationOption[] = candidates
        .slice(0, 9)
        .map(([conversationId, { label }], i) => ({ index: i + 1, conversationId, label }));

    await log('NEEDS_DISAMBIGUATION', {
        parsedText: text,
        payload: { _disambiguation: options, sns: rawPayload } as Prisma.InputJsonValue,
    });
    const picker = options.map((option) => `${option.index} for ${option.label}`).join(', ');
    await sendSms(
        fromPhone,
        `The B Life: who is that reply for? Reply ${picker} — or visit ${SITE_URL}/messages`
    );
}
