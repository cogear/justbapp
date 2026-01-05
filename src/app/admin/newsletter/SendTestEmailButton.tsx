'use client';

import { useState } from 'react';
import { sendTestNewsletter } from './actions';
import { Mail, Loader2 } from 'lucide-react';

interface SendTestEmailButtonProps {
    dateString: string;
}

export function SendTestEmailButton({ dateString }: SendTestEmailButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSendTest = async () => {
        if (!confirm('Send a test newsletter to cogear@gmail.com?')) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const result = await sendTestNewsletter(dateString);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `✅ Test email sent to ${result.recipient}!`
                });
            } else {
                setMessage({
                    type: 'error',
                    text: `❌ Failed: ${result.error}`
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: '❌ Failed to send test email'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={handleSendTest}
                disabled={isLoading}
                className="px-6 py-3 bg-primary/10 text-primary border border-primary/30 rounded-full font-medium text-sm hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending Test...
                    </>
                ) : (
                    <>
                        <Mail size={16} />
                        Send Test Email
                    </>
                )}
            </button>

            {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
