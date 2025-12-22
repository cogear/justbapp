'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            setStatus('success');
            setMessage(data.message || 'Thank you for joining the "b" life.');
            setEmail('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <section className="bg-primary/5 py-16 px-6 rounded-3xl border border-primary/10 max-w-2xl mx-auto my-12">
            <div className="text-center space-y-4 mb-8">
                <h3 className="text-3xl font-serif font-bold text-foreground">Stay Connected</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Join our intentional mailing list for quiet updates, small joys, and the release of the "b" life manifesto.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
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
                No noise. just b.
            </p>
        </section>
    );
}
