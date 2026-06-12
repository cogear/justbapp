'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';

export type AmbientVariant = 'portal' | 'feed' | 'course' | 'lesson';
export type AmbientMode = 'day' | 'night';

// The three.js chunk is only fetched if this component decides to mount it.
const AmbientField = dynamic(
    () => import('./ambient-field').then((m) => m.AmbientField),
    { ssr: false }
);

/**
 * Client gate for the ambient layer.
 * - Nature-scene floor: sunlit dandelion meadow (light) / dusk meadow (dark),
 *   CSS-toggled so there's no hydration dependency, with a readability wash.
 * - Only dynamic-imports three.js when motion is allowed AND WebGL exists,
 *   so reduced-motion visitors never download the chunk.
 * - Day mode floats dandelion seeds; night mode, fireflies.
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

    const slug = pathname.split('/')[2];
    const variant: AmbientVariant = !slug
        ? 'portal'
        : spaceTypes[slug] === 'COURSE'
          ? searchParams.get('lesson')
              ? 'lesson'
              : 'course'
          : 'feed';

    const mode: AmbientMode = resolvedTheme === 'dark' ? 'night' : 'day';

    return (
        <>
            {/* Nature floor — gradient base, then the theme's scene, then a wash */}
            <div aria-hidden className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
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
                {/* Readability wash over the scene */}
                <div className="absolute inset-0 bg-background/50 dark:bg-background/40" />
            </div>

            {enabled && (
                <div
                    aria-hidden
                    className={`fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000 ${
                        ready ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <AmbientField variant={variant} mode={mode} onReady={() => setReady(true)} />
                </div>
            )}
        </>
    );
}
