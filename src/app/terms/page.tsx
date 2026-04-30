import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'b. | Terms of Service',
    description: 'The terms that govern your use of b.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background py-24 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-3xl space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="space-y-4 border-b border-border/40 pb-12">
                    <h1 className="text-5xl font-georgia text-primary tracking-tight">Terms of Service</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-xs">
                        Effective: January 1st, 2026
                    </p>
                </header>

                <div className="prose prose-stone dark:prose-invert max-w-none space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">1. Acceptance</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            By accessing or using b. (&ldquo;the Service&rdquo;), you agree to be bound by these Terms. If you do not agree, please refrain from using the Service. We may update these Terms from time to time, and continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">2. The Sanctuary</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            b. is a digital sanctuary offering writing, courses, community spaces, and tools designed to help you slow down intentionally. The Service is provided for personal, non-commercial use unless otherwise agreed in writing.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">3. Your Account</h2>
                        <ul className="space-y-4 text-muted-foreground font-light text-lg list-none p-0">
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">Eligibility.</strong>
                                    You must be at least 13 years old to create an account.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">Accuracy.</strong>
                                    You agree to provide truthful information and to keep your account credentials secure.
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="text-primary mt-1">✧</span>
                                <div>
                                    <strong className="text-foreground font-medium block">Responsibility.</strong>
                                    You are responsible for activity that occurs under your account.
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">4. Your Content</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            You retain ownership of anything you post, comment, or share on b. By posting, you grant us a non-exclusive, worldwide, royalty-free license to display and distribute that content within the Service. You are responsible for ensuring you have the rights to share what you post.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">5. Acceptable Use</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            Please be kind. You agree not to use the Service to harass others, infringe intellectual property, distribute malicious software, scrape or reverse-engineer the Service, or interfere with its normal operation. We may suspend or terminate accounts that violate these expectations.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">6. Our Content</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            Writing, courses, designs, and software produced by b. are protected by copyright and other intellectual property laws. You may read and reference our work for personal use; reproduction, redistribution, or commercial use requires written permission.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">7. Purchases &amp; Subscriptions</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            Some parts of the Service, including b.shop and certain courses or memberships, may require payment. Prices, fulfillment, returns, and refunds are described at the point of purchase. Subscriptions renew on the cadence selected unless cancelled in advance.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">8. Third-Party Services</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            The Service may link to or integrate with third-party services (for example, payment processors, email delivery, or our store at shop.theblife.com). We are not responsible for the practices of those third parties; their own terms and privacy policies apply.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">9. Disclaimer</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            The Service is provided &ldquo;as is&rdquo; without warranties of any kind. Content on b., including the Lens, Pulse, and editorial writing, is offered for reflection and inspiration. It is not medical, psychological, financial, or legal advice.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">10. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            To the fullest extent permitted by law, b. and its contributors will not be liable for indirect, incidental, or consequential damages arising from your use of the Service.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">11. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                            You may close your account at any time. We may suspend or end your access if we believe these Terms have been violated, or if continued provision of the Service is no longer feasible.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-georgia text-foreground">12. Contact</h2>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg italic">
                            Questions about these Terms can be sent to hello@theblife.com.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
