import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { routeInboundSms } from '@/lib/messaging/sms-routing';
import type { DeliveryStatus, Prisma } from '@prisma/client';

/**
 * Telnyx webhook endpoint for two-way SMS.
 * - Inbound replies (`message.received`) → routed to a conversation.
 * - Outbound status events (`message.sent` / `message.finalized`) → correlate
 *   to MessageDelivery rows.
 * Configure the messaging profile's webhook to this URL (API v2) and set
 * TELNYX_PUBLIC_KEY (the account's Ed25519 public key from the Telnyx portal).
 * Verification: Ed25519 over `{timestamp}|{rawBody}`.
 */

const REPLAY_WINDOW_MS = 5 * 60 * 1000;
// DER SPKI prefix for a raw Ed25519 public key (so Node crypto can load it).
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function verifySignature(rawBody: string, sigB64: string, timestamp: string): boolean {
    const pub = process.env.TELNYX_PUBLIC_KEY;
    if (!pub || !sigB64 || !timestamp) return false;
    try {
        const der = Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(pub, 'base64')]);
        const key = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
        const ok = crypto.verify(
            null,
            Buffer.from(`${timestamp}|${rawBody}`),
            key,
            Buffer.from(sigB64, 'base64'),
        );
        if (!ok) return false;
        const ageMs = Math.abs(Date.now() - Number(timestamp) * 1000);
        return Number.isFinite(ageMs) ? ageMs <= REPLAY_WINDOW_MS : true;
    } catch (e) {
        console.error('Telnyx signature verification error:', e);
        return false;
    }
}

const STATUS_MAP: Record<string, DeliveryStatus> = {
    delivered: 'DELIVERED',
    sent: 'SENT',
    sending_failed: 'FAILED',
    delivery_failed: 'FAILED',
    expired: 'FAILED',
};

export async function POST(req: Request) {
    const rawBody = await req.text();
    const sig = req.headers.get('telnyx-signature-ed25519') || '';
    const ts = req.headers.get('telnyx-timestamp') || '';

    if (!verifySignature(rawBody, sig, ts)) {
        return new Response('Invalid signature', { status: 400 });
    }

    let evt: { data?: Record<string, unknown> };
    try {
        evt = JSON.parse(rawBody);
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    const data = (evt.data ?? {}) as Record<string, unknown>;
    const eventType = String(data.event_type ?? '');
    const payload = (data.payload ?? {}) as Record<string, unknown>;

    // ── Inbound reply ──
    if (eventType === 'message.received') {
        const fromPhone = String((payload.from as { phone_number?: string })?.phone_number ?? '');
        const body = typeof payload.text === 'string' ? payload.text : '';
        const providerId = String(payload.id ?? data.id ?? '');
        const toList = Array.isArray(payload.to) ? (payload.to as { phone_number?: string }[]) : [];
        const toNumber = toList[0]?.phone_number ?? '';

        if (!fromPhone) return new Response('Ignored', { status: 200 });

        if (providerId) {
            const existing = await prisma.inboundMessage.findUnique({ where: { providerId } });
            if (existing) return new Response('Already processed', { status: 200 });
        }

        try {
            await routeInboundSms({
                fromPhone,
                toNumber,
                body,
                providerId,
                rawPayload: payload as unknown as Prisma.InputJsonValue,
            });
        } catch (e) {
            console.error('Failed to route inbound SMS:', e);
            return new Response('Processing failed', { status: 500 });
        }
        return new Response('Processed', { status: 200 });
    }

    // ── Outbound delivery status → correlate to MessageDelivery ──
    const toList = Array.isArray(payload.to) ? (payload.to as { status?: string }[]) : [];
    const status = STATUS_MAP[String(toList[0]?.status ?? '').toLowerCase()];
    const providerMessageId = String(payload.id ?? '');
    if (status && providerMessageId) {
        await prisma.messageDelivery
            .updateMany({ where: { providerMessageId }, data: { status } })
            .catch((e) => console.error('Delivery correlation failed:', e));
    }

    return new Response('OK', { status: 200 });
}
