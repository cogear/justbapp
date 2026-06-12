'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';
import { inviteToSpace } from '@/lib/messaging/invitations';

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

/** Invite someone (by email or phone) to a space. */
export async function inviteMember(spaceId: string, contact: string, note?: string) {
    if (!contact || !contact.trim()) {
        return { error: 'Enter an email address or phone number' };
    }

    const user = await getOrCreateUser();
    if (!user) return { error: 'Not authenticated' };

    return inviteToSpace({ inviterId: user.id, spaceId, contact, note });
}

/** Accept an invitation (signed-in user claiming /invite/[token]). */
export async function acceptInvitation(token: string) {
    const user = await getOrCreateUser();
    if (!user) return { error: 'Not authenticated' };

    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { space: { select: { slug: true } } },
    });
    if (!invitation) return { error: 'Invitation not found' };
    if (invitation.status === 'ACCEPTED') {
        // Idempotent for the claimer; anyone else gets a clear message
        return invitation.acceptedUserId === user.id
            ? { success: true, spaceSlug: invitation.space.slug }
            : { error: 'This invitation has already been used' };
    }
    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
        return { error: 'This invitation is no longer valid' };
    }

    try {
        await prisma.$transaction([
            prisma.spaceMember.upsert({
                where: { spaceId_userId: { spaceId: invitation.spaceId, userId: user.id } },
                create: { spaceId: invitation.spaceId, userId: user.id },
                update: {},
            }),
            prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED', acceptedUserId: user.id },
            }),
        ]);

        revalidatePath(`/community/${invitation.space.slug}`);
        return { success: true, spaceSlug: invitation.space.slug };
    } catch (e) {
        console.error('Failed to accept invitation:', e);
        return { error: 'Failed to accept the invitation' };
    }
}
