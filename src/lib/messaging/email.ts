import 'server-only';
import { getResend } from '@/lib/resend';
import type { ReactElement } from 'react';

/**
 * Provider-agnostic email sending for the messaging hub.
 * Resend is the only implementation today; if volume or inbound reliability
 * ever demands SES, this file is the only thing that changes (plus DNS).
 */

export const REPLY_DOMAIN = process.env.REPLY_DOMAIN || 'reply.theblife.com';
export const MESSAGES_FROM_ADDRESS = process.env.MESSAGES_FROM_EMAIL || 'messages@theblife.com';

export type SendEmailResult = { id: string } | { error: string };

export async function sendEmail({
    to,
    from,
    replyTo,
    subject,
    react,
}: {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    react: ReactElement;
}): Promise<SendEmailResult> {
    try {
        const { data, error } = await getResend().emails.send({
            from,
            to: [to],
            replyTo,
            subject,
            react,
        });
        if (error || !data) {
            return { error: error?.message || 'Unknown send failure' };
        }
        return { id: data.id };
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'Unknown send failure' };
    }
}

/** From-header for relayed member messages: masks the sender's real address. */
export function maskedFrom(senderName: string) {
    // Strip quotes/angle brackets so a display name can't forge header structure
    const safe = senderName.replace(/["<>]/g, '').trim() || 'A member';
    return `${safe} via The B Life <${MESSAGES_FROM_ADDRESS}>`;
}

/** Thread-specific reply address for a conversation participant. */
export function replyAddress(replyToken: string) {
    return `t-${replyToken}@${REPLY_DOMAIN}`;
}

/** Extract a reply token from an inbound `to` address, or null. */
export function parseReplyAddress(address: string): string | null {
    const match = address.toLowerCase().match(/^t-([a-z0-9]+)@/);
    return match ? match[1] : null;
}
