'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { acceptInvitation } from '@/app/community/invite-actions';

export function AcceptInviteButton({ token }: { token: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAccept = async () => {
        if (loading) return;
        setLoading(true);
        const result = await acceptInvitation(token);
        setLoading(false);

        if ('error' in result && result.error) {
            toast.error(result.error);
            return;
        }
        if ('spaceSlug' in result) {
            toast.success('Welcome in.');
            router.push(`/community/${result.spaceSlug}`);
        }
    };

    return (
        <button
            onClick={handleAccept}
            disabled={loading}
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
        >
            {loading ? 'Joining…' : 'Accept invitation'}
        </button>
    );
}
