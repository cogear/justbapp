import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { routeInboundSms } from '@/lib/messaging/sms-routing';
import type { DeliveryStatus, Prisma } from '@prisma/client';

/**
 * Sent (sent.dm) webhook endpoint for two-way SMS.
 * - Inbound replies arrive as `message.received` events → routed to a conversation.
 * - Outbound status events correlate to MessageDelivery rows.
 * Configure the webhook URL + signing secret in the Sent dashboard
 * (see docs/sent-sms-setup.md). Verification: HMAC-SHA256 over
 * `{id}.{timestamp}.{rawBody}` with the `whsec_`-stripped, base64-decoded secret.
 */

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

function verifySignature(rawBody: string, id: string, timestamp: string, signature: string): boolean {
    const secret = process.env.SENT_WEBHOOK_SECRET;
    if (!secret || !id || !timestamp || !signature) return false;

    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const signed = `${id}.${timestamp}.${rawBody}`;
    const expected = 'v1,' + crypto.createHmac('sha256', key).update(signed).digest('base64');

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function timestampFresh(timestamp: string): boolean {
    let ms: number;
    if (/^\d+$/.test(timestamp)) {
        ms = timestamp.length >= 13 ? Number(timestamp) : Number(timestamp) * 1000;
    } else {
        ms = Date.parse(timestamp);
    }
    if (Number.isNaN(ms)) return true; // unparseable → rely on the signature alone
    return Math.abs(Date.now() - ms) <= REPLAY_WINDOW_MS;
}

const STATUS_MAP: Record<string, DeliveryStatus> = {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    FAILED: 'FAILED',
    UNDELIVERED: 'FAILED',
};

export async function POST(req: Request) {
    const rawBody = await req.text();
    const id = req.headers.get('x-webhook-id') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const signature = req.headers.get('x-webhook-signature') || '';

    if (!verifySignature(rawBody, id, timestamp, signature) || !timestampFresh(timestamp)) {
        return new Response('Invalid signature', { status: 400 });
    }

    let evt: Record<string, unknown>;
    try {
        evt = JSON.parse(rawBody);
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    const event = String(evt.event ?? evt.type ?? '');
    const payload = (evt.payload as Record<string, unknown>) ?? evt;

    const direction = String(payload.direction ?? '');
    const isInbound = event === 'message.received' || direction === 'INBOUND';

    // ── Outbound delivery status → correlate to MessageDelivery ──
    if (!isInbound) {
        const status = STATUS_MAP[String(payload.status ?? '').toUpperCase()];
        const providerMessageId = String(payload.message_id ?? payload.id ?? '');
        if (status && providerMessageId) {
            await prisma.messageDelivery
                .updateMany({ where: { providerMessageId }, data: { status } })
                .catch((e) => console.error('Delivery correlation failed:', e));
        }
        return new Response('OK', { status: 200 });
    }

    // ── Inbound reply → route into a conversation ──
    const fromPhone = String(payload.from ?? payload.phone_number ?? '');
    const body = typeof payload.text === 'string' ? payload.text : String(payload.body ?? '');
    const providerId = String(payload.message_id ?? payload.id ?? id);

    if (!fromPhone) return new Response('Ignored', { status: 200 });

    // Idempotency across webhook retries
    if (providerId) {
        const existing = await prisma.inboundMessage.findUnique({ where: { providerId } });
        if (existing) return new Response('Already processed', { status: 200 });
    }

    try {
        await routeInboundSms({
            fromPhone,
            toNumber: String(payload.to ?? payload.destination ?? ''),
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
