import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { stackServerApp } from '@/lib/stack';
import { SmsOptInForm } from '@/components/messages/sms-opt-in-form';
import { BUSINESS } from '@/lib/business';

export const metadata: Metadata = {
    title: 'Text Message Updates',
    description:
        'Opt in to receive text messages from The B Life — account verification codes, message alerts, event reminders, and announcements. Message frequency varies. Message and data rates may apply. Reply STOP to cancel, HELP for help.',
    alternates: { canonical: 'https://theblife.com/sms' },
};

// Public page — must NOT require sign-in (carriers review the opt-in form here).
export const dynamic = 'force-dynamic';

export default async function SmsOptInPage() {
    const stackUser = await stackServerApp.getUser().catch(() => null);
    const smsAvailable = Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_SMS_FROM);

    return (
        <main className="min-h-screen bg-background py-24 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="space-y-4 border-b border-border/40 pb-10">
                    <h1 className="text-4xl md:text-5xl font-georgia text-primary tracking-tight">
                        {BUSINESS.brandName} Text Updates
                    </h1>
                    <p className="text-muted-foreground font-light text-lg">
                        Stay connected by text — on your terms.
                    </p>
                </header>

                {/* The opt-in form (phone field + consent + full language). */}
                <SmsOptInForm signedIn={Boolean(stackUser)} smsAvailable={smsAvailable} />

                {/* Full program disclosure — rendered server-side so it is always
                    visible (this is the SMS opt-in language carriers require). */}
                <section className="space-y-6 text-muted-foreground leading-relaxed font-light">
                    <div className="space-y-3">
                        <h2 className="text-xl font-georgia text-foreground">About this messaging program</h2>
                        <p>
                            When you opt in, {BUSINESS.brandName} ({BUSINESS.legalName}) will send you
                            recurring SMS text messages. These include account verification (one-time
                            passcodes), alerts when another member sends you a direct message, reminders for
                            events and gatherings you care about, and occasional announcements from
                            {' '}{BUSINESS.brandName}. You only receive the categories you turn on in your
                            notification settings.
                        </p>
                    </div>

                    <ul className="space-y-2 list-none p-0">
                        <li className="flex gap-3 items-start">
                            <span className="text-primary mt-1">✧</span>
                            <span><strong className="text-foreground">Message frequency varies</strong> based on your activity and the notifications you enable.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-primary mt-1">✧</span>
                            <span><strong className="text-foreground">Message and data rates may apply.</strong> Your mobile carrier&rsquo;s standard rates apply to messages you send and receive.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-primary mt-1">✧</span>
                            <span>Text <strong className="text-foreground">STOP</strong> at any time to unsubscribe from all messages. You will receive one confirmation message, then no further texts.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-primary mt-1">✧</span>
                            <span>Text <strong className="text-foreground">HELP</strong> for help, or contact us at{' '}
                                <a href={`mailto:${BUSINESS.email}`} className="text-primary hover:underline underline-offset-4">{BUSINESS.email}</a>{' '}
                                or{' '}
                                <a href={`tel:${BUSINESS.phone}`} className="text-primary hover:underline underline-offset-4">{BUSINESS.phoneDisplay}</a>.
                            </span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-primary mt-1">✧</span>
                            <span>Consent to receive text messages is <strong className="text-foreground">not a condition of purchase</strong> or of using {BUSINESS.brandName}.</span>
                        </li>
                    </ul>

                    <p className="text-sm">
                        For details on how we collect and use your information, including your mobile number,
                        see our{' '}
                        <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                            Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                            Terms of Service
                        </Link>. We do not sell or share your mobile information with third parties for their
                        marketing or promotional purposes.
                    </p>
                </section>
            </div>
        </main>
    );
}
