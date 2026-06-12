'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/gtag';

/**
 * Fires the GA4 `sign_up` conversion once, when a double opt-in confirmation
 * succeeds. Rendered only on the success branch of the verify page.
 */
export function ConfirmTracker() {
    useEffect(() => {
        trackEvent('sign_up', { method: 'newsletter' });
    }, []);

    return null;
}
