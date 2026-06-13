import 'server-only';
import prisma from '@/lib/prisma';

/**
 * SMS via Sent (sent.dm). Sent is template-only — there is no free-form text
 * field — so callers pass an approved template name + variables, not a string.
 * See src/lib/messaging/sms-templates.ts for the template registry.
 *
 * Inert until SENT_API_KEY is configured.
 */

const SENT_API_URL = process.env.SENT_API_URL || 'https://api.sent.dm';

// The delivery channel (SMS now; iMessage/WhatsApp/RCS later) is derived from
// the template's enabled channels + Sent's router — not a request field.

export type SmsMessage = {
    /** Approved Sent template name. */
    template: string;
    /** Positional template variables (var_1, var_2, …). */
    variables?: Record<string, string>;
};

export type SendSmsResult = { id: string } | { error: string; optedOut?: boolean };

export function smsEnabled() {
    return Boolean(process.env.SENT_API_KEY);
}

export async function sendSms(to: string, message: SmsMessage): Promise<SendSmsResult> {
    const apiKey = process.env.SENT_API_KEY;
    if (!apiKey) return { error: 'SMS is not configured (SENT_API_KEY missing)' };
    if (!message.template) return { error: 'SMS template name missing' };

    try {
        const res = await fetch(`${SENT_API_URL}/v3/messages`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
            body: JSON.stringify({
                to: [to],
                template: { name: message.template },
                ...(message.variables ? { variables: message.variables } : {}),
            }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
            const code = data?.error?.code ?? '';
            const detail = data?.error?.message ?? `Sent API error ${res.status}`;
            // Sent auto-suppresses opted-out contacts; mirror locally so we stop trying.
            const optedOut = /opt.?ed.?\s?out|unsubscrib|suppress|OPT_OUT/i.test(`${code} ${detail}`);
            if (optedOut) {
                await prisma.user
                    .updateMany({ where: { phone: to }, data: { smsActive: false } })
                    .catch(() => {});
            }
            console.error('SMS send failed:', detail);
            return { error: detail, optedOut };
        }

        const id = data?.data?.message_id ?? data?.data?.messageId;
        return id ? { id } : { error: 'Sent: no message_id in response' };
    } catch (e) {
        const detail = e instanceof Error ? e.message : 'Unknown SMS failure';
        console.error('SMS send failed:', detail);
        return { error: detail };
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
