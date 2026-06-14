import 'server-only';
import prisma from '@/lib/prisma';
import type { SmsTemplate, SmsVars } from '@/lib/messaging/sms-templates';

/**
 * SMS via Telnyx. Free-form text — the message is built by a local template
 * renderer (see sms-templates.ts) and sent through Telnyx's Messages API.
 * Inert until TELNYX_API_KEY and TELNYX_SMS_FROM are configured.
 */

const TELNYX_API_URL = process.env.TELNYX_API_URL || 'https://api.telnyx.com';

export type SmsMessage = {
    /** A renderer from SMS_TEMPLATES. */
    template: SmsTemplate;
    /** Positional template variables (var_1, var_2, …). */
    variables?: SmsVars;
};

export type SendSmsResult = { id: string } | { error: string; optedOut?: boolean };

export function smsEnabled() {
    return Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_SMS_FROM);
}

export async function sendSms(to: string, message: SmsMessage): Promise<SendSmsResult> {
    const apiKey = process.env.TELNYX_API_KEY;
    const from = process.env.TELNYX_SMS_FROM;
    if (!apiKey || !from) {
        return { error: 'SMS is not configured (TELNYX_API_KEY / TELNYX_SMS_FROM missing)' };
    }

    const text = message.template(message.variables ?? {});

    try {
        const res = await fetch(`${TELNYX_API_URL}/v2/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({ from, to, text }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
            const errs: string =
                data?.errors?.map((e: { code?: string; title?: string; detail?: string }) =>
                    `${e.code ?? ''} ${e.title ?? ''} ${e.detail ?? ''}`.trim(),
                ).join('; ') || `Telnyx API error ${res.status}`;
            // Telnyx blocks sends to opted-out numbers; mirror locally so we stop trying.
            const optedOut = /opt.?ed.?\s?out|unsubscrib|suppress|blocked|40300|40010/i.test(errs);
            if (optedOut) {
                await prisma.user
                    .updateMany({ where: { phone: to }, data: { smsActive: false } })
                    .catch(() => {});
            }
            console.error('SMS send failed:', errs);
            return { error: errs, optedOut };
        }

        const id = data?.data?.id;
        return id ? { id } : { error: 'Telnyx: no message id in response' };
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
