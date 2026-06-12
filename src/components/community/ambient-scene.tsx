'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export type AmbientVariant = 'portal' | 'hero' | 'feed' | 'course' | 'lesson';
export type AmbientMode = 'day' | 'night';

// The three.js chunk is only fetched if the gate below decides to mount it.
const AmbientField = dynamic(
    () => import('./ambient-field').then((m) => m.AmbientField),
    { ssr: false }
);

/**
 * The living nature layer, sized to its PARENT (which must be positioned):
 * sunlit dandelion meadow by day / dusk meadow by night, a readability wash,
 * and the particle field (seeds ↔ fireflies). Used full-viewport by the
 * community backdrop and inside the homepage hero.
 *
 * Reduced-motion / no-WebGL visitors get the still scene and never download
 * the three.js chunk.
 */
export function AmbientScene({
    variant,
    washClassName = 'bg-background/50 dark:bg-background/40',
}: {
    variant: AmbientVariant;
    washClassName?: string;
}) {
    const [enabled, setEnabled] = useState(false);
    const [ready, setReady] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        // Probe after paint — keeps the effect body free of sync setState
        // and lets the scene floor render first.
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

    const mode: AmbientMode = resolvedTheme === 'dark' ? 'night' : 'day';

    return (
        <>
            {/* Nature floor — gradient base, then the theme's scene, then a wash */}
            <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="ambient-gradient absolute inset-0" />
                <Image
                    src="/images/community/meadow-day.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover block dark:hidden"
                    priority={false}
                />
                <Image
                    src="/images/community/meadow-dusk.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover hidden dark:block"
                    priority={false}
                />
                <div className={`absolute inset-0 ${washClassName}`} />
            </div>

            {enabled && (
                <div
                    aria-hidden
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                        ready ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <AmbientField variant={variant} mode={mode} onReady={() => setReady(true)} />
                </div>
            )}
        </>
    );
}
