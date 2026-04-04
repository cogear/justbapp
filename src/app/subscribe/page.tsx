import React from 'react';
import Image from 'next/image';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Mail } from 'lucide-react';
import { stackServerApp } from '@/lib/stack';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Subscribe to The b. Life Newsletter",
    description: "Join The b. Life community. Get weekly insights on intentional living, AI-informed perspectives, and curated content delivered to your inbox.",
    alternates: { canonical: "https://theblife.com/subscribe" },
};

export default async function SubscribePage() {
    const user = await stackServerApp.getUser();
    const email = user?.primaryEmail || undefined;

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] flex items-center justify-center p-6 md:p-12">
            <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white dark:bg-secondary/5 rounded-[3rem] overflow-hidden shadow-2xl border border-border/40 animate-in fade-in zoom-in-95 duration-1000">
                {/* Visual Side */}
                <div className="relative hidden md:block h-full min-h-[600px]">
                    <Image
                        src="/images/connection.png"
                        alt="A moment of genuine human connection"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                    <div className="absolute bottom-12 left-12 right-12 text-white space-y-2">
                        <p className="text-sm tracking-[0.3em] uppercase opacity-80 font-light">Community</p>
                        <h2 className="text-3xl font-dynapuff">The power of being.</h2>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-16 flex flex-col justify-center space-y-12">
                    <header className="space-y-6">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-2xl">
                            <Mail size={32} />
                        </div>
                        <h1 className="text-5xl font-georgia text-primary tracking-tight">b.connected</h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed">
                            Stay in touch with the quiet essence of the "b" life. Join our community of mindful observers.
                        </p>
                    </header>

                    <NewsletterSignup initialEmail={email} />

                    <footer className="pt-8 opacity-20 text-xs tracking-widest uppercase">
                        just be.
                    </footer>
                </div>
            </div>
        </main>
    );
}
