import 'server-only';
import prisma from '@/lib/prisma';
import { sendEmail, maskedFrom, replyAddress, MESSAGES_FROM_ADDRESS } from '@/lib/messaging/email';
import { sendSms, smsEnabled } from '@/lib/messaging/sms';
import { DirectMessageEmail } from '@/emails/DirectMessageEmail';
import { NotificationEmail } from '@/emails/NotificationEmail';
import * as React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';

export type NotificationCategory = 'event' | 'announce';

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
                                    phone: true,
                                    phoneVerifiedAt: true,
                                    smsConsentAt: true,
                                    smsActive: true,
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

        // ── Email channel — default ON for DMs unless prefs say otherwise ──
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
        } else {
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

        // ── SMS channel — opt-in only (verified phone + consent + pref) ──
        const wantsSms = user.notificationPreference?.dmSms ?? false;
        if (
            wantsSms &&
            smsEnabled() &&
            !user.isPhantom &&
            user.smsActive &&
            user.phone &&
            user.phoneVerifiedAt &&
            user.smsConsentAt
        ) {
            const delivery = await prisma.messageDelivery.create({
                data: {
                    messageId: message.id,
                    recipientId: user.id,
                    channel: 'SMS',
                    status: 'QUEUED',
                },
            });

            // Keep within ~2 segments; full text is always at /messages
            const preview =
                message.content.length > 240 ? `${message.content.slice(0, 237)}…` : message.content;
            const result = await sendSms(
                user.phone,
                `${senderName} via The B Life: ${preview} — reply to respond, or visit ${SITE_URL}/messages`
            );

            await prisma.messageDelivery.update({
                where: { id: delivery.id },
                data:
                    'id' in result
                        ? { status: 'SENT', providerMessageId: result.id }
                        : { status: 'FAILED', error: result.error },
            }).catch(() => {});
        }
    }
}

/**
 * Automated send to a single member over their enabled channels
 * (event reminders, announcements). Respects notification preferences,
 * emailActive/smsActive flags, and SMS verification/consent. Used by
 * cron jobs and system events — NOT for member↔member messages
 * (those go through notifyMessageRecipients so replies thread).
 */
export async function sendToMember(
    userId: string,
    {
        subject,
        text,
        category,
        ctaLabel,
        ctaUrl,
    }: {
        subject: string;
        text: string;
        category: NotificationCategory;
        ctaLabel?: string;
        ctaUrl?: string;
    }
): Promise<{ email: boolean; sms: boolean }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPreference: true },
    });
    const sent = { email: false, sms: false };
    if (!user || user.isPhantom) return sent;

    const prefs = user.notificationPreference;
    const wantsEmail = category === 'event' ? (prefs?.eventEmail ?? true) : (prefs?.announceEmail ?? true);
    const wantsSms = category === 'event' ? (prefs?.eventSms ?? false) : (prefs?.announceSms ?? false);

    if (wantsEmail && user.emailActive) {
        const result = await sendEmail({
            to: user.email,
            from: `The B Life <${MESSAGES_FROM_ADDRESS}>`,
            subject,
            react: React.createElement(NotificationEmail, {
                heading: subject,
                bodyText: text,
                ctaLabel,
                ctaUrl,
            }),
        });
        sent.email = 'id' in result;
        if ('error' in result) console.error(`sendToMember email failed for ${userId}:`, result.error);
    }

    if (
        wantsSms &&
        smsEnabled() &&
        user.smsActive &&
        user.phone &&
        user.phoneVerifiedAt &&
        user.smsConsentAt
    ) {
        const body = ctaUrl ? `${text} ${ctaUrl}` : text;
        const result = await sendSms(user.phone, `The B Life: ${body}`);
        sent.sms = 'id' in result;
        if ('error' in result) console.error(`sendToMember SMS failed for ${userId}:`, result.error);
    }

    return sent;
}
