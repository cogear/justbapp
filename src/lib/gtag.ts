// Lightweight client-side helper for Google Analytics 4 (gtag.js).
// The gtag script is loaded globally in src/app/layout.tsx (G-0DW5BR7WLY).

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/** Fire a GA4 event. Safe to call before gtag has loaded (it's a no-op then). */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', name, params);
}

export {};
