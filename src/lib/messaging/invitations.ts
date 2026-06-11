import 'server-only';
import prisma from '@/lib/prisma';
import { sendEmail, MESSAGES_FROM_ADDRESS } from '@/lib/messaging/email';
import { sendSms, smsEnabled, normalizePhone } from '@/lib/messaging/sms';
import {
    getOrCreatePairConversation,
    createConversationMessage,
} from '@/lib/messaging/conversations';
import { notifyMessageRecipients } from '@/lib/messaging/notify';
import { SpaceInviteEmail } from '@/emails/SpaceInviteEmail';
import * as React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';

const MAX_INVITES_PER_DAY = 10;
const REINVITE_COOLDOWN_DAYS = 7;
const INVITE_TTL_DAYS = 30;
const NOTE_MAX_LENGTH = 140;

export type InviteResult =
    | { success: true; kind: 'email_sent' | 'sms_sent' | 'dm_sent' }
    | { error: string };

/** Cap length and strip links — personal notes must not become a phishing vector. */
export function sanitizeNote(note: string | undefined | null): string | null {
    if (!note) return null;
    const cleaned = note
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/www\.\S+/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, NOTE_MAX_LENGTH);
    return cleaned || null;
}

export async function inviteToSpace({
    inviterId,
    spaceId,
    contact,
    note,
}: {
    inviterId: string;
    spaceId: string;
    contact: string;
    note?: string;
}): Promise<InviteResult> {
    // Inviter must belong to the space
    const membership = await prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId, userId: inviterId } },
        include: {
            space: { select: { name: true, slug: true } },
            user: { select: { displayName: true, email: true } },
        },
    });
    if (!membership) return { error: 'Join this space before inviting others' };

    // Parse the contact: email or phone
    const trimmed = contact.trim();
    const isEmail = trimmed.includes('@');
    const email = isEmail ? trimmed.toLowerCase() : null;
    const phone = isEmail ? null : normalizePhone(trimmed);

    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email!)) {
        return { error: 'Please enter a valid email address' };
    }
    if (!isEmail && !phone) {
        return { error: 'Please enter a valid email address or phone number' };
    }
    if (!isEmail && !smsEnabled()) {
        return { error: 'Text invitations are coming soon — try their email instead' };
    }

    const identifier = (email || phone)!;

    // Respect suppression (STOP, declines, bounces)
    const suppressed = await prisma.contactSuppression.findUnique({ where: { identifier } });
    if (suppressed) {
        return { error: 'This contact has asked not to receive invitations' };
    }

    // Rate limit per inviter
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.invitation.count({
        where: { inviterId, createdAt: { gt: since24h } },
    });
    if (recentCount >= MAX_INVITES_PER_DAY) {
        return { error: 'You have reached the invitation limit for today' };
    }

    // Re-invite cooldown per contact + space
    const cooldownStart = new Date(Date.now() - REINVITE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const recentInvite = await prisma.invitation.findFirst({
        where: {
            spaceId,
            createdAt: { gt: cooldownStart },
            OR: [...(email ? [{ contactEmail: email }] : []), ...(phone ? [{ contactPhone: phone }] : [])],
        },
    });
    if (recentInvite) {
        return { error: 'This person was invited recently — give them a little time' };
    }

    const sanitizedNote = sanitizeNote(note);
    const inviterName = membership.user.displayName || 'A member';
    const spaceName = membership.space.name;

    // Existing member? Route as an in-app message instead of a raw invite
    const existingUser = await prisma.user.findFirst({
        where: email ? { email } : { phone: phone! },
    });

    if (existingUser) {
        if (existingUser.id === inviterId) return { error: 'You cannot invite yourself' };

        const alreadyMember = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId: existingUser.id } },
        });
        if (alreadyMember) return { error: 'They are already a member of this space' };

        const invitation = await prisma.invitation.create({
            data: {
                inviterId,
                spaceId,
                contactEmail: email,
                contactPhone: phone,
                personalNote: sanitizedNote,
                channel: 'APP',
                expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
            },
        });

        const conversation = await getOrCreatePairConversation(inviterId, existingUser.id);
        const message = await createConversationMessage({
            conversationId: conversation.id,
            authorId: inviterId,
            content: `${sanitizedNote ? `${sanitizedNote}\n\n` : ''}I'd love for you to join ${spaceName} on The B Life. Accept here: ${SITE_URL}/invite/${invitation.token}`,
        });
        try {
            await notifyMessageRecipients(message.id);
        } catch (e) {
            console.error('Invite DM fan-out failed:', e);
        }
        return { success: true, kind: 'dm_sent' };
    }

    // Brand-new contact → invitation + outbound send
    const invitation = await prisma.invitation.create({
        data: {
            inviterId,
            spaceId,
            contactEmail: email,
            contactPhone: phone,
            personalNote: sanitizedNote,
            channel: email ? 'EMAIL' : 'SMS',
            expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
        },
    });
    const inviteUrl = `${SITE_URL}/invite/${invitation.token}`;

    if (email) {
        const result = await sendEmail({
            to: email,
            from: `The B Life <${MESSAGES_FROM_ADDRESS}>`,
            subject: `${inviterName} invited you to join ${spaceName}`,
            react: React.createElement(SpaceInviteEmail, {
                inviterName,
                spaceName,
                personalNote: sanitizedNote,
                inviteUrl,
            }),
        });
        if ('error' in result) {
            await prisma.invitation.delete({ where: { id: invitation.id } }).catch(() => {});
            console.error('Invite email failed:', result.error);
            return { error: 'Could not send the invitation — please try again' };
        }
        return { success: true, kind: 'email_sent' };
    }

    // SMS invite: one-time, person-triggered, identified, with STOP language
    const smsBody =
        `${inviterName} invited you to join ${spaceName} on The B Life` +
        `${sanitizedNote ? `: "${sanitizedNote}"` : ''}. ` +
        `Accept: ${inviteUrl} — Reply STOP to opt out.`;
    const result = await sendSms(phone!, smsBody);
    if ('error' in result) {
        await prisma.invitation.delete({ where: { id: invitation.id } }).catch(() => {});
        console.error('Invite SMS failed:', result.error);
        return { error: 'Could not send the invitation — please check the number' };
    }
    return { success: true, kind: 'sms_sent' };
}
