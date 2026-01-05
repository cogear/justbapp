import React from 'react';
import { Metadata } from 'next';
import { format } from 'date-fns';
import { stackServerApp } from '@/lib/stack';
import { getNewsletterPreview } from './actions';
import { SendNewsletterButton } from './SendNewsletterButton';
import { SendTestEmailButton } from './SendTestEmailButton';
import { NewsletterEmail } from '@/emails/NewsletterEmail';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'b. | Newsletter',
    description: 'A multisensory briefing on the daily essence.',
};

export default async function NewsletterPage({
    searchParams,
}: {
    searchParams: { date?: string };
}) {
    const params = await searchParams;
    const requestedDate = params.date ? new Date(params.date) : new Date();
    // Use local date string instead of UTC to avoid rollover issues in the evening
    const dateString = params.date || format(requestedDate, 'yyyy-MM-dd');

    const content = await getNewsletterPreview(dateString);

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] py-16 px-6 transition-colors duration-500">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <header className="mb-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl font-georgia text-primary">b.newsletter</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        {format(requestedDate, 'EEEE, MMMM do, yyyy')}
                    </p>
                </header>

                <div className="mb-16 w-full max-w-2xl bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-700">
                    <div className="text-center">
                        <h2 className="text-xl font-georgia text-primary mb-2">Admin Dashboard</h2>
                        <p className="text-sm text-muted-foreground">Preview the daily essence and distribute it to your community.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <SendTestEmailButton dateString={dateString} />
                        <SendNewsletterButton dateString={dateString} />
                    </div>
                </div>

                {!content ? (
                    <div className="w-full max-w-2xl text-center py-24 bg-secondary/10 rounded-[3rem] border border-dashed border-border/40 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <p className="text-muted-foreground text-lg italic">
                            The daily brief is being prepared.
                            <br />
                            <span className="text-sm not-italic opacity-60 mt-2 block">Check back shortly for the latest essence.</span>
                        </p>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center gap-12">
                        {/* Email Preview Header */}
                        <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs font-bold">
                            <Mail size={14} />
                            Email Preview
                        </div>

                        {/* High Fidelity Email Preview Container */}
                        <div className="w-full max-w-[600px] bg-white text-charcoal border border-border/40 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            {/* Inner Email Content - Scoped Style */}
                            <div className="pointer-events-none select-none">
                                <NewsletterEmail
                                    date={content.date}
                                    heroImage={content.heroImage}
                                    anchorQuote={content.anchorQuote}
                                    anchorElaboration={content.anchorElaboration}
                                    signalTitle={content.signalTitle}
                                    signalGist={content.signalGist}
                                    bridgeContent={content.bridgeContent}
                                    applicationInternal={content.applicationInternal}
                                    applicationExternal={content.applicationExternal}
                                    closingSummary={content.closingSummary}
                                    permissionStatement={content.permissionStatement}
                                    newsRecap={content.newsRecap}
                                    previewMode={true}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <p className="text-muted-foreground italic text-sm">
                                Prefer the full experience?
                            </p>
                            <Link
                                href={`/blog?date=${dateString}`}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Read the full blog post <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}

                <footer className="mt-24 text-center opacity-30 text-xs tracking-widest uppercase">
                    just be.
                </footer>
            </div>
        </main>
    );
}
