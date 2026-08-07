import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import Link from 'next/link';
import { ConfirmTracker } from './ConfirmTracker';
import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata("Verify Subscription");

export const dynamic = 'force-dynamic';

export default async function VerifyNewsletterPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { token } = await searchParams;
    let status: 'success' | 'error' = 'error';
    let message = 'Invalid or expired verification link.';

    if (token && typeof token === 'string') {
        try {
            // Find user with this token
            const user = await prisma.user.findUnique({
                where: { newsletterVerificationToken: token },
            });

            if (user) {
                // Activate subscription and clear token
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isNewsletterSubscriber: true,
                        newsletterVerificationToken: null,
                    },
                });

                status = 'success';
                message = 'Your subscription has been confirmed.';

                // Send the welcome email logic here
                // Note: We resend the welcome email now that they are confirmed.
                try {
                    await resend.emails.send({
                        from: 'b <updates@theblife.com>',
                        to: [user.email],
                        subject: 'Welcome to the b life.',
                        react: WelcomeEmail(),
                    });
                    // Create audience contact if needed (optional based on previous logic)
                    await resend.contacts.create({
                        email: user.email,
                        unsubscribed: false,
                        // audienceId: process.env.RESEND_AUDIENCE_ID
                    });

                } catch (emailError) {
                    console.error('Error sending welcome email after verification:', emailError);
                    // Don't fail the page render if email sending fails, the sub is active
                }
            } else {
                message = 'This verification link is invalid or has already been used.';
            }
        } catch (e) {
            console.error('Verification error:', e);
            message = 'An error occurred during verification. Please try again.';
        }
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                {status === 'success' && <ConfirmTracker />}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {status === 'success' ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                </div>

                <h1 className="text-3xl font-serif font-bold text-foreground">
                    {status === 'success' ? 'Subscription Confirmed' : 'Verification Failed'}
                </h1>

                <p className="text-muted-foreground leading-relaxed">
                    {message}
                </p>

                <div className="pt-6">
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
