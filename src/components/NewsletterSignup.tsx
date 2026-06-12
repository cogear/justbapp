'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/gtag';

export function NewsletterSignup({
    initialEmail,
    heading = 'Stay Connected',
    blurb = 'Join our intentional mailing list for quiet updates, small joys, and the release of the "b" life manifesto.',
    note = 'No noise. just b.',
}: {
    initialEmail?: string;
    /** Section heading; pass null to hide (e.g. when the page already has the hero). */
    heading?: string | null;
    /** Supporting blurb under the heading; pass null to hide. */
    blurb?: string | null;
    /** Small line near the button — cadence/boundary microcopy. */
    note?: string;
}) {
    const [email, setEmail] = useState(initialEmail || '');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(!!initialEmail);

    // Sync state with prop if it changes (e.g. after hydration or data loading)
    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
            setAgreed(true);
        }
    }, [initialEmail]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Use the prop directly if available to avoid any state desync issues
        const emailToSubmit = initialEmail || email;

        if (initialEmail && !agreed) {
            setStatus('error');
            setMessage('Please check the box to sign up.');
            return;
        }

        if (!emailToSubmit || !emailToSubmit.includes('@')) {
            setStatus('error');
            setMessage('Please provide a valid email address.');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToSubmit }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            setStatus('success');
            setMessage(data.message || 'Please check your email to confirm your subscription.');
            if (!initialEmail) setEmail('');

            // GA4: lead captured (email submitted, pending double opt-in confirmation)
            trackEvent('generate_lead', { method: 'newsletter' });
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    return (
        <section className="bg-primary/5 py-16 px-6 rounded-3xl border border-primary/10 max-w-2xl mx-auto my-12">
            {(heading || blurb) && (
                <div className="text-center space-y-4 mb-8">
                    {heading && <h3 className="text-3xl font-serif font-bold text-foreground">{heading}</h3>}
                    {blurb && <p className="text-muted-foreground leading-relaxed">{blurb}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
                {initialEmail ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-background border border-border rounded-2xl text-center">
                            <span className="text-foreground font-medium">{initialEmail}</span>
                        </div>
                        <div className="flex flex-col items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                                />
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    Sign me up for the Daily Anchor
                                </span>
                            </label>
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success' || !agreed}
                                className="w-full px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                                {status === 'loading' ? 'Joining...' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading' || status === 'success'}
                            className="flex-1 px-6 py-3 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            {status === 'loading' ? 'Joining...' : 'Subscribe'}
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mt-4 text-center text-sm font-medium ${status === 'error' ? 'text-destructive' : 'text-primary'
                                }`}
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </form>

            <p className="text-[10px] text-center text-muted-foreground/60 mt-8 uppercase tracking-widest italic">
                {note}
            </p>
        </section>
    );
}
