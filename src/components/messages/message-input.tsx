'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sendMessage } from '@/app/messages/actions';
import { Send } from 'lucide-react';

export function MessageInput({ conversationId }: { conversationId: string }) {
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || sending) return;

        setSending(true);
        const result = await sendMessage(conversationId, content);
        setSending(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        setContent('');
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                placeholder="Write a message…"
                rows={2}
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-2xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground resize-none disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={sending || !content.trim()}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                aria-label="Send message"
            >
                <Send size={18} />
            </button>
        </form>
    );
}
