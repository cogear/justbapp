import { headers } from 'next/headers';
import { Webhook } from 'svix';
import prisma from '@/lib/prisma';

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    // Verify webhook secret is configured
    if (!webhookSecret) {
        console.error('RESEND_WEBHOOK_SECRET is not configured');
        return new Response('Webhook not configured', { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();

    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing svix headers');
        return new Response('Missing svix headers', { status: 400 });
    }

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
        evt = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as { type: string; data: any };
    } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    const { type, data } = evt;

    console.log(`Received Resend webhook: ${type}`, data);

    // Handle different event types
    switch (type) {
        case 'email.bounced':
            await handleBounce(data);
            break;
        case 'email.complained':
            await handleComplaint(data);
            break;
        case 'email.delivery_delayed':
            console.log(`Email delivery delayed: ${data.email}`);
            break;
        default:
            console.log(`Unhandled event type: ${type}`);
    }

    return new Response('Webhook processed', { status: 200 });
}

async function handleBounce(data: any) {
    const email = data.email;
    console.log(`Email bounced: ${email}`, data);

    try {
        const result = await prisma.user.updateMany({
            where: { email },
            data: { emailActive: false }
        });

        if (result.count > 0) {
            console.log(`✅ Disabled email for bounced address: ${email}`);
        } else {
            console.log(`⚠️  No user found with email: ${email}`);
        }
    } catch (error) {
        console.error(`❌ Failed to disable bounced email ${email}:`, error);
    }
}

async function handleComplaint(data: any) {
    const email = data.email;
    console.log(`Spam complaint received: ${email}`, data);

    try {
        const result = await prisma.user.updateMany({
            where: { email },
            data: { emailActive: false }
        });

        if (result.count > 0) {
            console.log(`✅ Disabled email for spam complaint: ${email}`);
        } else {
            console.log(`⚠️  No user found with email: ${email}`);
        }
    } catch (error) {
        console.error(`❌ Failed to disable complained email ${email}:`, error);
    }
}
