'use client';

import React, { useEffect, useRef } from 'react';

interface ThreeDBookProps {
    coverImage: string;
    /** Tilt toward the pointer on fine-pointer devices (reduced-motion aware). */
    interactive?: boolean;
}

export function ThreeDBook({ coverImage, interactive = false }: ThreeDBookProps) {
    const bookRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!interactive) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const book = bookRef.current;
        if (!book) return;

        let targetY = 35;
        let targetX = 0;
        let currentY = 35;
        let currentX = 0;
        let rafId = 0;

        const onPointerMove = (e: PointerEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            targetY = 35 + nx * 8;
            targetX = -ny * 4;
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });

        const tick = () => {
            rafId = requestAnimationFrame(tick);
            currentY += (targetY - currentY) * 0.05;
            currentX += (targetX - currentX) * 0.05;
            book.style.transform = `rotateY(${currentY}deg) rotateX(${currentX}deg)`;
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
        };
    }, [interactive]);

    return (
        <div
            className="relative perspective-2000 w-[300px] h-[480px] group"
        >
            <div
                ref={bookRef}
                className="relative w-full h-full preserve-3d"
                style={{
                    transform: `rotateY(35deg)`
                }}
            >
                {/* Front Cover */}
                <div
                    className="absolute inset-0 bg-white backface-hidden rounded-r-sm shadow-xl"
                    style={{
                        transform: 'translateZ(25px)',
                        backgroundImage: `url(${coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'right center', // Focus on the front cover part of the jacket
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Texture/Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none mix-blend-overlay"></div>
                    {/* Spine Highlight for depth */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
                </div>

                {/* Spine — plain cloth, no stretched cover art */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-[50px] backface-hidden"
                    style={{
                        transform: 'rotateY(-90deg) translateZ(25px)',
                        backgroundColor: '#FCFBF8',
                        width: '50px',
                        height: '100%'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10 pointer-events-none"></div>
                </div>

                {/* Back Cover */}
                <div
                    className="absolute inset-0 bg-white backface-hidden rounded-l-sm shadow-xl"
                    style={{
                        transform: 'rotateY(180deg) translateZ(25px)',
                        backgroundImage: `url(${coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'left center', // Focus on the back cover
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/20 to-transparent"></div>
                </div>

                {/* Pages (Right Side) — mirrors the spine placement so it hugs the cover edge */}
                <div
                    className="absolute right-0 top-2 bottom-2 w-[48px] bg-[#F5F2EB]"
                    style={{
                        transform: 'rotateY(90deg) translateZ(24px)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                        backgroundImage: 'linear-gradient(90deg, #e3e3e3 1px, transparent 1px)',
                        backgroundSize: '4px 100%'
                    }}
                />

                {/* Pages (Top) */}
                <div
                    className="absolute top-0 left-0 right-0 h-[48px] bg-[#F5F2EB]"
                    style={{
                        transform: 'rotateX(90deg) translateZ(25px)',
                        width: '298px', // Slightly less than full width
                        left: '1px',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                    }}
                />

                {/* Pages (Bottom) — mirrors the top placement */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[48px] bg-[#F5F2EB]"
                    style={{
                        transform: 'rotateX(-90deg) translateZ(24px)',
                        width: '298px',
                        left: '1px',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                    }}
                />

            </div>
        </div>
    );
}
