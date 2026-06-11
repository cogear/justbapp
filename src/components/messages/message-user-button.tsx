'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { startConversation } from '@/app/messages/actions';
import { MessageCircle } from 'lucide-react';

/** Small affordance to open (or create) a DM with a member. */
export function MessageUserButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);
        const result = await startConversation(userId);
        setLoading(false);

        if ('error' in result && result.error) {
            toast.error(result.error);
            return;
        }
        if ('conversationId' in result) {
            router.push(`/messages/${result.conversationId}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors disabled:opacity-50"
            aria-label="Message this member"
            title="Message"
        >
            <MessageCircle size={16} />
        </button>
    );
}
