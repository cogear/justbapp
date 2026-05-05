import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'b. | Privacy Policy',
    description: 'Our commitment to your digital sanctuary.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-3xl space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="space-y-4 border-b border-border/40 pb-12">
                    <h1 className="text-5xl font-georgia text-primary tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-xs">
                        Effective: January 1st, 2026
                    </p>
                </header>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">1. Your Sanctuary</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            At b., we believe in the sanctity of your digital life. Our mission is to provide a sanctuary, not a surveillance engine. We collect only what is necessary to refine your experience. This Privacy Policy applies to the b. website at theblife.com and to our TikTok application, blife-social.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">2. Information We Collect</h2>
                        <ul className="space-y-4 text-muted-foreground font-light text-lg list-none p-0">
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">Personal Identity.</strong>
                                    Your email address is used solely for authentication and our internal newsletter.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">The Lens.</strong>
                                    We store your psychographic profile to tailor the perspective of news and summaries to your unique personality.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">Pulse Data.</strong>
                                    The daily energy ratings you provide help us understand the collective mood of our community.
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">3. Our Use of Data</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            Data is used to provide personalization. We do not sell your personal information to third parties. We do not use your data for advertising targeting.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">4. Security</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            We employ modern industry standards to protect your data. Your "Lens" is private to you and the AI models that help us refine your experience.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">5. Contact</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg italic">
                            Should you have questions or wish for your sanctuary to be removed from our records, please contact us at hello@theblife.com.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
