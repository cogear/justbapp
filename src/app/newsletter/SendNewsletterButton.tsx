'use client';

import React, { useState } from 'react';
import { sendNewsletter } from './actions';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export function SendNewsletterButton({ dateString }: { dateString: string }) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [sentCount, setSentCount] = useState<number>(0);

    const handleSend = async () => {
        if (!confirm('Are you sure you want to send this newsletter to all subscribers?')) return;

        setStatus('sending');
        setError(null);

        const result = await sendNewsletter(dateString);

        if (result.success) {
            setStatus('success');
            setSentCount(result.count || 0);
        } else {
            setStatus('error');
            setError(result.error || 'Failed to send newsletter');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={handleSend}
                disabled={status === 'sending' || status === 'success'}
                className={`
                    inline-flex items-center gap-3 px-10 py-4 rounded-full font-medium tracking-wide shadow-md transition-all duration-300
                    ${status === 'idle' ? 'bg-primary text-primary-foreground hover:shadow-xl hover:-translate-y-1' : ''}
                    ${status === 'sending' ? 'bg-primary/50 text-primary-foreground cursor-not-allowed' : ''}
                    ${status === 'success' ? 'bg-green-600 text-white cursor-default' : ''}
                    ${status === 'error' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                `}
            >
                {status === 'idle' && (
                    <>
                        <Send size={20} />
                        Send Newsletter to Subscribers
                    </>
                )}
                {status === 'sending' && (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle size={20} />
                        Successfully Sent to {sentCount} Users
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertCircle size={20} />
                        Retry Sending
                    </>
                )}
            </button>

            {status === 'error' && (
                <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </p>
            )}

            {status === 'success' && (
                <p className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    The daily essence has been distributed.
                </p>
            )}
        </div>
    );
}
