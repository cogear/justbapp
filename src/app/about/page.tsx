import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from '@/lib/business';

export const metadata: Metadata = {
    title: 'About',
    description:
        'The b. Life is a wellness and intentional-living community founded by David Crowell, author of the book The b. Life. Operated by Eau Gallie Solutions LLC, Melbourne, FL.',
    alternates: { canonical: 'https://theblife.com/about' },
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-3xl space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="space-y-4 border-b border-border/40 pb-12">
                    <h1 className="text-5xl font-georgia text-primary tracking-tight">About {BUSINESS.brandName}</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-xs">
                        A home for intentional living
                    </p>
                </header>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">Who we are</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            {BUSINESS.displayName} is a wellness and intentional-living community founded by
                            David Crowell, author of the book <em>The b. Life</em>. We exist to help people
                            slow down, use technology with clarity, and live with more intention in a world
                            that keeps speeding up.
                        </p>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            {BUSINESS.brandName} is operated by {BUSINESS.legalName}, based in Melbourne, Florida.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">What we offer</h2>
                        <ul className="space-y-4 text-muted-foreground font-light text-lg list-none p-0">
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">The seven principles.</strong>
                                    A practical philosophy for intentional living — acceptance, quality,
                                    slowness, balance, community, gratitude, and comfort as achievement.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">AI-literacy courses.</strong>
                                    Two courses — <em>AI for Humans</em> and <em>Living with AI</em> — written
                                    for real people who want to understand and use AI with good judgment.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">A member community.</strong>
                                    Daily essays, community spaces, gatherings, and a personalized news lens —
                                    a grounded place to connect.
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">Text message updates</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            Members can opt in to receive account verification codes and the notifications they
                            choose — direct messages, event reminders, and occasional announcements — by text.
                            See our{' '}
                            <Link href="/sms" className="text-primary hover:underline underline-offset-4">
                                text messaging opt-in
                            </Link>{' '}
                            page for details, or read how we handle your number in our{' '}
                            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                                Privacy Policy
                            </Link>.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">Contact</h2>
                        <address className="not-italic text-muted-foreground leading-relaxed font-light text-lg space-y-1">
                            <p className="text-foreground font-medium">{BUSINESS.legalName}</p>
                            <p>{BUSINESS_ADDRESS_ONE_LINE}</p>
                            <p>
                                Phone:{' '}
                                <a href={`tel:${BUSINESS.phone}`} className="text-primary hover:underline underline-offset-4">
                                    {BUSINESS.phoneDisplay}
                                </a>
                            </p>
                            <p>
                                Email:{' '}
                                <a href={`mailto:${BUSINESS.email}`} className="text-primary hover:underline underline-offset-4">
                                    {BUSINESS.email}
                                </a>
                            </p>
                        </address>
                    </section>
                </div>
            </div>
        </main>
    );
}
