import prisma from '@/lib/prisma';
import { routeInboundSms } from '@/lib/messaging/sms-routing';

/**
 * AWS SNS HTTPS endpoint for two-way SMS (AWS End User Messaging).
 * Handles the SNS subscription handshake and inbound SMS notifications.
 * Configure: EUM two-way config → SNS topic → HTTPS subscription to this URL.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MessageValidator = require('sns-validator');
const validator = new MessageValidator();

function validateSnsMessage(message: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
        validator.validate(message, (err: Error | null) => (err ? reject(err) : resolve()));
    });
}

export async function POST(req: Request) {
    let envelope: Record<string, unknown>;
    try {
        envelope = JSON.parse(await req.text());
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    // Verify the SNS signature before trusting anything in the payload
    try {
        await validateSnsMessage(envelope);
    } catch (err) {
        console.error('SNS signature validation failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    const type = envelope.Type;

    if (type === 'SubscriptionConfirmation') {
        const subscribeUrl = String(envelope.SubscribeURL || '');
        if (!subscribeUrl.startsWith('https://sns.')) {
            return new Response('Suspicious SubscribeURL', { status: 400 });
        }
        try {
            await fetch(subscribeUrl);
            console.log('SNS subscription confirmed for SMS webhook');
        } catch (err) {
            console.error('Failed to confirm SNS subscription:', err);
            return new Response('Confirmation failed', { status: 500 });
        }
        return new Response('Subscribed', { status: 200 });
    }

    if (type !== 'Notification') {
        return new Response('Ignored', { status: 200 });
    }

    // EUM inbound SMS payload rides in the SNS Message field
    let inbound: {
        originationNumber?: string;
        destinationNumber?: string;
        messageBody?: string;
        inboundMessageId?: string;
    };
    try {
        inbound = JSON.parse(String(envelope.Message || '{}'));
    } catch {
        console.warn('SNS notification Message was not JSON; ignoring');
        return new Response('Ignored', { status: 200 });
    }

    const fromPhone = inbound.originationNumber;
    const body = inbound.messageBody;
    if (!fromPhone || typeof body !== 'string') {
        return new Response('Ignored', { status: 200 });
    }

    // Idempotency across SNS retries
    const providerId = inbound.inboundMessageId || String(envelope.MessageId || '');
    if (providerId) {
        const existing = await prisma.inboundMessage.findUnique({ where: { providerId } });
        if (existing) return new Response('Already processed', { status: 200 });
    }

    try {
        await routeInboundSms({
            fromPhone,
            toNumber: inbound.destinationNumber || '',
            body,
            providerId,
            rawPayload: inbound as Record<string, string>,
        });
    } catch (e) {
        console.error('Failed to route inbound SMS:', e);
        return new Response('Processing failed', { status: 500 });
    }

    return new Response('Processed', { status: 200 });
}
