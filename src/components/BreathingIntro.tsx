'use client';

import React, { useEffect, useState } from 'react';

interface BreathingIntroProps {
    onComplete: () => void;
}

export default function BreathingIntro({ onComplete }: BreathingIntroProps) {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Total duration: ~4s
        // Inhale: 1.5s
        // Hold: 1s
        // Exhale: 1.5s

        const inhaleTimer = setTimeout(() => setPhase('hold'), 1500);
        const holdTimer = setTimeout(() => setPhase('exhale'), 2500);
        const completeTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
        }, 4000);

        return () => {
            clearTimeout(inhaleTimer);
            clearTimeout(holdTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-b-sand transition-opacity duration-500">
            <div
                className={`
          w-32 h-32 rounded-full bg-b-sage/20 backdrop-blur-sm
          transition-all duration-[1500ms] ease-in-out
          ${phase === 'inhale' ? 'scale-150 opacity-100' : ''}
          ${phase === 'hold' ? 'scale-150 opacity-100' : ''}
          ${phase === 'exhale' ? 'scale-50 opacity-0' : ''}
        `}
            />
            <p className={`
        mt-8 text-b-charcoal/60 font-medium tracking-widest uppercase text-sm
        transition-opacity duration-1000
        ${phase === 'exhale' ? 'opacity-0' : 'opacity-100'}
      `}>
                {phase === 'inhale' && 'Inhale'}
                {phase === 'hold' && 'Hold'}
                {phase === 'exhale' && 'Release'}
            </p>
        </div>
    );
}
