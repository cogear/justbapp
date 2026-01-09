import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NewsletterConfirmationEmail } from '@/emails/NewsletterConfirmationEmail';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // 0. Generate a verification token
        const verificationToken = crypto.randomUUID();

        // 1. Persist to our database with the token
        // We set isNewsletterSubscriber to FALSE initially for double opt-in
        await (prisma.user as any).upsert({
            where: { email },
            update: {
                newsletterVerificationToken: verificationToken,
                // Don't change subscription status if they are already false/true, 
                // but if they are re-subscribing, they might be effectively resetting.
                // For safety, let's keep their current status or set to false?
                // If they are already true, they don't need to verify, but if they are here, they might want to.
                // Let's assume re-verification is harmless.
            },
            create: {
                email,
                isNewsletterSubscriber: false,
                newsletterVerificationToken: verificationToken
            },
        });

        const host = request.headers.get('host') || 'theblife.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const confirmationUrl = `${protocol}://${host}/newsletter/verify?token=${verificationToken}`;

        // 2. Send Confirmation Email
        const { error: emailError } = await resend.emails.send({
            from: 'b <updates@theblife.com>',
            to: [email],
            subject: 'Please confim your subscription',
            react: NewsletterConfirmationEmail({ confirmationUrl }),
        });

        if (emailError) {
            return NextResponse.json({
                success: false,
                error: emailError.message
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Please check your email to confirm your subscription.'
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}
