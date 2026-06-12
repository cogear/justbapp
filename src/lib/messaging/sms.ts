import 'server-only';
import prisma from '@/lib/prisma';

/**
 * SMS sending via AWS End User Messaging (Pinpoint SMS v2).
 * Inert until SMS_ORIGINATION_NUMBER is configured (post-10DLC approval).
 */

export type SendSmsResult = { id: string } | { error: string; optedOut?: boolean };

export function smsEnabled() {
    return Boolean(process.env.SMS_ORIGINATION_NUMBER);
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
    const originationNumber = process.env.SMS_ORIGINATION_NUMBER;
    if (!originationNumber) {
        return { error: 'SMS is not configured (SMS_ORIGINATION_NUMBER missing)' };
    }

    try {
        const { PinpointSMSVoiceV2Client, SendTextMessageCommand } = await import(
            '@aws-sdk/client-pinpoint-sms-voice-v2'
        );
        const client = new PinpointSMSVoiceV2Client({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        const result = await client.send(
            new SendTextMessageCommand({
                DestinationPhoneNumber: to,
                OriginationIdentity: originationNumber,
                MessageBody: body,
                MessageType: 'TRANSACTIONAL',
            })
        );

        if (!result.MessageId) return { error: 'No message id returned' };
        return { id: result.MessageId };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown SMS failure';
        const optedOut = /opt.?ed.?\s?out|OPTED_OUT/i.test(message);

        if (optedOut) {
            // Mirror the emailActive bounce pattern: stop sending to this number
            await prisma.user
                .updateMany({ where: { phone: to }, data: { smsActive: false } })
                .catch(() => {});
        }

        console.error('SMS send failed:', message);
        return { error: message, optedOut };
    }
}

/** Normalize a US-centric phone input to E.164, or null if invalid. */
export function normalizePhone(input: string): string | null {
    const digits = input.replace(/[^\d+]/g, '');
    if (/^\+1\d{10}$/.test(digits)) return digits;
    if (/^1\d{10}$/.test(digits)) return `+${digits}`;
    if (/^\d{10}$/.test(digits)) return `+1${digits}`;
    if (/^\+\d{8,15}$/.test(digits)) return digits; // other countries, already E.164
    return null;
}
