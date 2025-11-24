'use client';

import React from 'react';

interface PulseSliderProps {
    labelLeft: string;
    labelRight: string;
    value: number;
    onChange: (value: number) => void;
}

export default function PulseSlider({
    labelLeft,
    labelRight,
    value,
    onChange,
}: PulseSliderProps) {
    return (
        <div className="w-full max-w-md mx-auto py-8">
            <div className="flex justify-between text-b-charcoal mb-4 font-medium">
                <span className="text-sm uppercase tracking-widest">{labelLeft}</span>
                <span className="text-sm uppercase tracking-widest">{labelRight}</span>
            </div>

            <div className="relative h-12 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-1 bg-b-mist rounded-full overflow-hidden">
                    {/* Optional: Gradient or fill based on value */}
                </div>

                {/* Range Input */}
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="
            absolute w-full h-full opacity-0 cursor-pointer z-10
          "
                />

                {/* Custom Thumb / Indicator */}
                <div
                    className="absolute h-6 w-6 bg-b-sage rounded-full shadow-md transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        left: `calc(${((value - 1) / 9) * 100}% - 12px)`
                    }}
                />

                {/* Visual Track Fill (Optional, for better feedback) */}
                <div
                    className="absolute h-1 bg-b-sage/50 rounded-full transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        width: `calc(${((value - 1) / 9) * 100}%)`
                    }}
                />
            </div>
        </div>
    );
}
