'use client';

import React from 'react';
import Image from 'next/image';
import { ImagePair } from '@/lib/visual-profiler/types';
import { cn } from '@/lib/utils';

interface VisualPairCardProps {
    pair: ImagePair;
    onSelect: (choice: 'A' | 'B') => void;
}

export function VisualPairCard({ pair, onSelect }: VisualPairCardProps) {
    // Helper to pick random variant
    const pickVariant = React.useCallback((config: typeof pair.imageA) => {
        if (config.variants && config.variants.length > 0) {
            return config.variants[Math.floor(Math.random() * config.variants.length)];
        }
        return config.src;
    }, []);

    // Initialize with the first variant (deterministic for SSR)
    const [imgA, setImgA] = React.useState(pair.imageA.variants?.[0] || pair.imageA.src);
    const [imgB, setImgB] = React.useState(pair.imageB.variants?.[0] || pair.imageB.src);

    // Randomize on mount (client-only)
    React.useEffect(() => {
        setImgA(pickVariant(pair.imageA));
        setImgB(pickVariant(pair.imageB));
    }, [pair, pickVariant]);

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto justify-center">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
                {/* Option A */}
                <button
                    onClick={() => onSelect('A')}
                    className="group relative w-full h-64 md:h-96 rounded-2xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/20 transition-transform active:scale-95"
                >
                    <Image
                        src={imgA}
                        alt={pair.imageA.alt}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImgA('/images/visual-profiler/p01a.png')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute inset-0 ring-0 group-hover:ring-4 ring-primary/50 transition-all duration-300 rounded-2xl" />
                </button>

                {/* Option B */}
                <button
                    onClick={() => onSelect('B')}
                    className="group relative w-full h-64 md:h-96 rounded-2xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/20 transition-transform active:scale-95"
                >
                    <Image
                        src={imgB}
                        alt={pair.imageB.alt}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImgB('/images/visual-profiler/p01b.png')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute inset-0 ring-0 group-hover:ring-4 ring-primary/50 transition-all duration-300 rounded-2xl" />
                </button>
            </div>
        </div>
    );
}
