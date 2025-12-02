'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';

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
            <div className="flex justify-between text-foreground mb-4 font-medium">
                <span className="text-sm uppercase tracking-widest">{labelLeft}</span>
                <span className="text-sm uppercase tracking-widest">{labelRight}</span>
            </div>

            <div className="px-2">
                <Slider
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                />
            </div>
        </div>
    );
}
