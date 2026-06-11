'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Light polling: refresh the conversation view periodically to pick up replies. */
export function ConversationRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
    const router = useRouter();

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') router.refresh();
        }, intervalMs);
        return () => clearInterval(id);
    }, [router, intervalMs]);

    return null;
}
