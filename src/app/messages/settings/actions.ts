'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { revalidatePath } from 'next/cache';
import { createHash, randomInt } from 'crypto';
import { sendSms, smsEnabled, normalizePhone } from '@/lib/messaging/sms';
import { SMS_TEMPLATES } from '@/lib/messaging/sms-templates';

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

async function getUser() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser?.primaryEmail) return null;
    return prisma.user.findUnique({ where: { email: stackUser.primaryEmail } });
}

function hashOtp(code: string) {
    return createHash('sha256').update(code).digest('hex');
}

export async function updateNotificationPrefs(prefs: {
    dmEmail: boolean;
    dmSms: boolean;
    eventEmail: boolean;
    eventSms: boolean;
    announceEmail: boolean;
    announceSms: boolean;
}) {
    const user = await getUser();
    if (!user) return { error: 'Not authenticated' };

    try {
        await prisma.notificationPreference.upsert({
            where: { userId: user.id },
            create: { userId: user.id, ...prefs },
            update: prefs,
        });
        revalidatePath('/messages/settings');
        return { success: true };
    } catch (e) {
        console.error('Failed to update notification prefs:', e);
        return { error: 'Failed to save preferences' };
    }
}

/**
 * Send a verification code to a phone number. Saving the (unverified) number
 * and verifying it doubles as TCPA express opt-in — the UI shows the required
 * disclosure next to the action that triggers this.
 */
export async function sendPhoneOtp(phoneInput: string) {
    const user = await getUser();
    if (!user) return { error: 'Not authenticated' };

    if (!smsEnabled()) {
        return { error: 'Text messaging is not available yet — check back soon.' };
    }

    const phone = normalizePhone(phoneInput);
    if (!phone) return { error: 'Please enter a valid phone number' };

    // Cooldown: infer last-send time from the stored expiry
    if (user.phoneOtpExpiresAt) {
        const lastSentAt = user.phoneOtpExpiresAt.getTime() - OTP_TTL_MS;
        if (Date.now() - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
            return { error: 'Please wait a minute before requesting another code' };
        }
    }

    const taken = await prisma.user.findFirst({
        where: { phone, NOT: { id: user.id } },
        select: { id: true },
    });
    if (taken) return { error: 'That phone number is already in use' };

    const code = randomInt(100000, 1000000).toString();

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                phone,
                phoneVerifiedAt: null,
                phoneOtpHash: hashOtp(code),
                phoneOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
            },
        });

        // The approved Sent template supplies the wording; we pass only the code.
        const result = await sendSms(phone, {
            template: SMS_TEMPLATES.otp,
            variables: { var_1: code },
        });
        if ('error' in result) {
            return { error: 'Could not send the code — please check the number and try again' };
        }
        return { success: true };
    } catch (e) {
        console.error('Failed to send phone OTP:', e);
        return { error: 'Failed to send verification code' };
    }
}

export async function confirmPhoneOtp(code: string) {
    const user = await getUser();
    if (!user) return { error: 'Not authenticated' };

    if (!user.phoneOtpHash || !user.phoneOtpExpiresAt || !user.phone) {
        return { error: 'No verification in progress — request a code first' };
    }
    if (user.phoneOtpExpiresAt < new Date()) {
        return { error: 'That code has expired — request a new one' };
    }
    if (hashOtp(code.trim()) !== user.phoneOtpHash) {
        return { error: 'That code is not correct' };
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                phoneVerifiedAt: new Date(),
                smsConsentAt: new Date(), // express opt-in recorded at verification
                smsActive: true,
                phoneOtpHash: null,
                phoneOtpExpiresAt: null,
            },
        });
        revalidatePath('/messages/settings');
        return { success: true };
    } catch (e) {
        console.error('Failed to confirm phone OTP:', e);
        return { error: 'Failed to verify phone' };
    }
}

export async function removePhone() {
    const user = await getUser();
    if (!user) return { error: 'Not authenticated' };

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                phone: null,
                phoneVerifiedAt: null,
                phoneOtpHash: null,
                phoneOtpExpiresAt: null,
                smsConsentAt: null,
            },
        });
        revalidatePath('/messages/settings');
        return { success: true };
    } catch (e) {
        console.error('Failed to remove phone:', e);
        return { error: 'Failed to remove phone' };
    }
}
