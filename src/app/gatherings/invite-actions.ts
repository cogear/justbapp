'use server';

// Host-layer bridge: resolves an email/phone contact and the signed-in inviter to
// opaque ids, mints a Gatherings invite token via the engine, and delivers the
// invite over the comms-hub (email / Sent SMS). The engine never sees an email.

import { getOrCreateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as service from '@/lib/gatherings/service';
import { normalizePhone, sendSms, smsEnabled } from '@/lib/messaging/sms';
import { SMS_TEMPLATES } from '@/lib/messaging/sms-templates';
import { sendEmail, MESSAGES_FROM_ADDRESS } from '@/lib/messaging/email';
import { GatheringsInviteEmail } from '@/emails/GatheringsInviteEmail';
import * as React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';
const MAX_INVITES_PER_DAY = 20;

/** Invite someone to a gathering by email or phone. Organizer-only (enforced in the engine). */
export async function inviteToGatheringAction(groupId: string, contact: string, note?: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  const trimmed = (contact || '').trim();
  if (!trimmed) return { error: 'Enter an email address or phone number' };

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
    return { error: 'Text invites aren’t available yet — try their email instead' };
  }

  // Suppression (host-owned contact list)
  const identifier = (email || phone)!;
  const suppressed = await prisma.contactSuppression
    .findUnique({ where: { identifier } })
    .catch(() => null);
  if (suppressed) return { error: 'This contact has asked not to receive messages' };

  // Rate limit per inviter (opaque count in the engine)
  const since = new Date(Date.now() - 86_400_000);
  if ((await service.countRecentInvitesBy(user.id, since)) >= MAX_INVITES_PER_DAY) {
    return { error: 'You’ve reached the invite limit for today' };
  }

  // Mint the token (also asserts organizer rights)
  let token: string;
  let groupName: string;
  try {
    const res = await service.createInvite(groupId, user.id);
    token = res.token;
    groupName = res.groupName;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not create the invitation' };
  }

  const inviteUrl = `${SITE_URL}/gatherings/invite/${token}`;
  const inviterName = user.displayName || 'A friend';
  const cleanNote = note?.trim() ? note.trim().slice(0, 140) : null;

  if (email) {
    const result = await sendEmail({
      to: email,
      from: `The B Life <${MESSAGES_FROM_ADDRESS}>`,
      subject: `${inviterName} invited you to ${groupName}`,
      react: React.createElement(GatheringsInviteEmail, {
        inviterName,
        gatheringName: groupName,
        personalNote: cleanNote,
        inviteUrl,
      }),
    });
    if ('error' in result) {
      console.error('Gathering invite email failed:', result.error);
      return { error: 'Could not send the invitation — please try again' };
    }
    return { success: true as const, kind: 'email' as const };
  }

  // SMS via the approved Sent invite template
  const result = await sendSms(phone!, {
    template: SMS_TEMPLATES.invite,
    variables: { var_1: inviterName, var_2: groupName, var_3: inviteUrl },
  });
  if ('error' in result) {
    console.error('Gathering invite SMS failed:', result.error);
    return { error: 'Could not send the text — please check the number' };
  }
  return { success: true as const, kind: 'sms' as const };
}

/** Accept an invite as the signed-in user (the token authorizes membership). */
export async function acceptGatheringInviteAction(token: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };
  try {
    const { groupId } = await service.acceptInvite(token, user.id);
    return { success: true as const, groupId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not accept the invitation' };
  }
}
