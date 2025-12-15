'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ThreeDBookProps {
    coverImage: string;
}

export function ThreeDBook({ coverImage }: ThreeDBookProps) {

    return (
        <div
            className="relative perspective-2000 w-[300px] h-[480px] group"
        >
            <div
                className="relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out"
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

                {/* Spine */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-[50px] bg-white backface-hidden"
                    style={{
                        transform: 'rotateY(-90deg) translateZ(25px)',
                        backgroundImage: `url(${coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center', // Focus on the spine
                        width: '50px',
                        height: '100%'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-white/10 to-black/10 pointer-events-none"></div>
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

                {/* Pages (Right Side) */}
                <div
                    className="absolute right-0 top-2 bottom-2 w-[48px] bg-[#F5F2EB]"
                    style={{
                        // Let's approximate: 300px width. rotateY(90) puts it at right edge.
                        // We want it recessed slightly. 
                        transform: 'rotateY(90deg) translateZ(274px)',
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

                {/* Pages (Bottom) */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[48px] bg-[#F5F2EB]"
                    style={{
                        // Height is 480. rotateX(-90) at bottom.
                        transform: 'rotateX(-90deg) translateZ(454px)',
                        width: '298px',
                        left: '1px',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                    }}
                />

            </div>
        </div>
    );
}
