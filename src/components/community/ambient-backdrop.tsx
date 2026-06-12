'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';

export type AmbientVariant = 'portal' | 'feed' | 'course' | 'lesson';

// The three.js chunk is only fetched if this component decides to mount it.
const AmbientField = dynamic(
    () => import('./ambient-field').then((m) => m.AmbientField),
    { ssr: false }
);

/**
 * Client gate for the ambient WebGL layer.
 * - Always renders the static gradient floor (zero layout shift, dark-mode aware).
 * - Only dynamic-imports three.js when motion is allowed AND WebGL exists,
 *   so reduced-motion visitors never download the chunk.
 */
export function AmbientBackdrop({
    spaceTypes,
}: {
    spaceTypes: Record<string, 'FEED' | 'COURSE'>;
}) {
    const [enabled, setEnabled] = useState(false);
    const [ready, setReady] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Probe after paint — keeps the effect body free of sync setState
        // and lets the gradient floor render first.
        const raf = requestAnimationFrame(() => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const canvas = document.createElement('canvas');
            const gl =
                canvas.getContext('webgl2') ||
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl');
            if (!gl) return;
            setEnabled(true);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    const slug = pathname.split('/')[2];
    const variant: AmbientVariant = !slug
        ? 'portal'
        : spaceTypes[slug] === 'COURSE'
          ? searchParams.get('lesson')
              ? 'lesson'
              : 'course'
          : 'feed';

    return (
        <>
            {/* Permanent gradient floor */}
            <div aria-hidden className="ambient-gradient fixed inset-0 -z-20 pointer-events-none" />
            {enabled && (
                <div
                    aria-hidden
                    className={`fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000 ${
                        ready ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <AmbientField variant={variant} onReady={() => setReady(true)} />
                </div>
            )}
        </>
    );
}
