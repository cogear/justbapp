import { headers } from 'next/headers';
import { Webhook } from 'svix';
import prisma from '@/lib/prisma';
import { parseReplyAddress } from '@/lib/messaging/email';
import { extractReplyText } from '@/lib/messaging/reply-parser';
import { createConversationMessage } from '@/lib/messaging/conversations';
import { notifyMessageRecipients } from '@/lib/messaging/notify';

const webhookSecret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;

/** Pull a bare email address out of "Name <addr@x>" or plain "addr@x". */
function bareAddress(value: string): string {
    const match = value.match(/<([^>]+)>/);
    return (match ? match[1] : value).trim().toLowerCase();
}

function toAddressList(to: unknown): string[] {
    if (!to) return [];
    if (typeof to === 'string') return to.split(',').map(bareAddress);
    if (Array.isArray(to)) {
        return to.map((entry) =>
            typeof entry === 'string'
                ? bareAddress(entry)
                : bareAddress((entry as { address?: string; email?: string })?.address || (entry as { email?: string })?.email || '')
        );
    }
    return [];
}

function stripHtml(html: string): string {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

export async function POST(req: Request) {
    if (!webhookSecret) {
        console.error('RESEND_INBOUND_WEBHOOK_SECRET is not configured');
        return new Response('Webhook not configured', { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();

    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response('Missing svix headers', { status: 400 });
    }

    const wh = new Webhook(webhookSecret);
    let evt;
    try {
        evt = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as { type: string; data: Record<string, unknown> };
    } catch (err) {
        console.error('Inbound webhook verification failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    const { type, data } = evt;
    if (!type.includes('received')) {
        return new Response('Ignored event type', { status: 200 });
    }

    // Idempotency: svix retries deliver the same svix-id
    const existing = await prisma.inboundMessage.findUnique({ where: { providerId: svixId } });
    if (existing) {
        return new Response('Already processed', { status: 200 });
    }

    const fromAddress = bareAddress(String(data.from ?? ''));
    const toAddresses = toAddressList(data.to);
    const replyTo = toAddresses.find((address) => parseReplyAddress(address));
    const token = replyTo ? parseReplyAddress(replyTo) : null;

    const rawText =
        typeof data.text === 'string' && data.text.trim()
            ? data.text
            : typeof data.html === 'string'
              ? stripHtml(data.html)
              : '';

    const log = async (
        status: 'MATCHED' | 'UNMATCHED' | 'REJECTED',
        extras: { parsedText?: string; messageId?: string } = {}
    ) =>
        prisma.inboundMessage.create({
            data: {
                channel: 'EMAIL',
                fromAddress,
                toAddress: replyTo || toAddresses[0] || '',
                providerId: svixId,
                rawPayload: JSON.parse(body),
                status,
                ...extras,
            },
        });

    if (!token) {
        await log('UNMATCHED');
        console.warn(`Inbound email had no reply token: to=${toAddresses.join(',')}`);
        return new Response('No reply token', { status: 200 });
    }

    const participant = await prisma.conversationParticipant.findUnique({
        where: { replyToken: token },
        include: { user: { select: { id: true, email: true } } },
    });

    if (!participant) {
        await log('UNMATCHED');
        console.warn(`Inbound email reply token matched no participant: ${token}`);
        return new Response('Unknown reply token', { status: 200 });
    }

    // Anti-spoofing: the From address must belong to the participant who owns the token
    if (participant.user.email.toLowerCase() !== fromAddress) {
        await log('REJECTED');
        console.warn(
            `Inbound email From mismatch: expected ${participant.user.email}, got ${fromAddress}`
        );
        return new Response('Sender mismatch', { status: 200 });
    }

    const parsedText = extractReplyText(rawText);
    if (!parsedText) {
        await log('REJECTED', { parsedText: '' });
        return new Response('Empty reply', { status: 200 });
    }

    try {
        const message = await createConversationMessage({
            conversationId: participant.conversationId,
            authorId: participant.userId,
            content: parsedText,
            sourceChannel: 'EMAIL',
        });

        await log('MATCHED', { parsedText, messageId: message.id });

        try {
            await notifyMessageRecipients(message.id);
        } catch (e) {
            console.error('Inbound reply fan-out failed:', e);
        }
    } catch (e) {
        console.error('Failed to thread inbound email:', e);
        await log('REJECTED', { parsedText }).catch(() => {});
        return new Response('Processing failed', { status: 500 });
    }

    return new Response('Processed', { status: 200 });
}
