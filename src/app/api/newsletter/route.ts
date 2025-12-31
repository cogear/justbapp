import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // 0. Persist to our database
        // Using 'as any' temporarily to bypass stale Prisma Client types in dev
        await (prisma.user as any).upsert({
            where: { email },
            update: { isNewsletterSubscriber: true },
            create: {
                email,
                isNewsletterSubscriber: true
            },
        });

        // 1. Try to add to Audience (managed newsletter list)
        // You must create an 'Audience' in the Resend dashboard first.
        let contactCreated = false;
        try {
            const { data: contactData, error: contactError } = await resend.contacts.create({
                email,
                unsubscribed: false,
                // audienceId: 'YOUR_AUDIENCE_ID', // Recommending logic: user adds this to .env later
            });

            if (!contactError) contactCreated = true;
        } catch (e) {
            console.warn('Silent failure adding to Resend Audience. This is likely because no Audience is configured.');
        }

        // 2. Send the Welcome Email immediately
        // Note: This requires the 'theblife.com' domain to be verified in Resend.
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'b <updates@theblife.com>',
            to: [email],
            subject: 'Welcome to the b life.',
            react: WelcomeEmail(),
        });

        if (emailError) {
            // If domain isn't verified yet, this will error. 
            // We'll return a specific message but won't crash the whole flow.
            return NextResponse.json({
                success: true,
                warning: 'Contact logged, but email delivery failed. Is theblife.com verified in Resend?',
                error: emailError.message
            });
        }

        return NextResponse.json({ success: true, contactCreated, emailSent: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}
