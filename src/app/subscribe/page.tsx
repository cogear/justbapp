import React from 'react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Mail } from 'lucide-react';
import { stackServerApp } from '@/lib/stack';

export default async function SubscribePage() {
    const user = await stackServerApp.getUser();
    const email = user?.primaryEmail || undefined;

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] py-24 px-6 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full text-center space-y-12">
                <header className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-[2rem] mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-5xl font-dynapuff text-primary tracking-tight">b.connected</h1>
                    <p className="text-xl text-muted-foreground font-light leading-relaxed">
                        Stay in touch with the quiet essence of the "b" life.
                    </p>
                </header>

                <div className="animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <NewsletterSignup initialEmail={email} />
                </div>

                <footer className="mt-12 text-center opacity-30 text-xs tracking-widest uppercase animate-in fade-in duration-1000 delay-500">
                    just be.
                </footer>
            </div>
        </main>
    );
}
