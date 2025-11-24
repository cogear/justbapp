'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import PulseSlider from '@/components/PulseSlider';
import BreathingIntro from '@/components/BreathingIntro';
import { saveDailyPulse } from './actions';

function PulseContent() {
    const router = useRouter();
    const user = useUser();
    const [showIntro, setShowIntro] = useState(true);
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [values, setValues] = useState({
        anxiousCalm: 5,
        scatteredFocused: 5,
        drainedEnergized: 5,
    });

    const handleComplete = async () => {
        setIsSubmitting(true);
        await saveDailyPulse(values);
        // Navigate to "Insight" or "Done" (for now, just refresh or go home)
        router.push('/');
    };

    const nextStep = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    // Redirect to sign-in if not authenticated
    useEffect(() => {
        if (user === null) {
            router.push('/sign-in');
        }
    }, [user, router]);

    // Show loading while checking auth
    if (user === undefined) {
        return (
            <main className="min-h-screen bg-b-sand flex items-center justify-center">
                <p className="text-b-charcoal/60">Loading...</p>
            </main>
        );
    }

    if (showIntro) {
        return <BreathingIntro onComplete={() => setShowIntro(false)} />;
    }

    return (
        <main className="min-h-screen bg-b-sand flex flex-col items-center justify-center p-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-md text-center space-y-12">

                <header className="space-y-4">
                    <h1 className="text-3xl font-serif text-b-charcoal">
                        Where is your energy?
                    </h1>
                    <p className="text-b-charcoal/60 text-sm tracking-wide">
                        Step {step + 1} of 3
                    </p>
                </header>

                <div className="min-h-[200px] flex items-center justify-center">
                    {step === 0 && (
                        <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500">
                            <PulseSlider
                                labelLeft="Anxious"
                                labelRight="Calm"
                                value={values.anxiousCalm}
                                onChange={(v) => setValues({ ...values, anxiousCalm: v })}
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500">
                            <PulseSlider
                                labelLeft="Scattered"
                                labelRight="Focused"
                                value={values.scatteredFocused}
                                onChange={(v) => setValues({ ...values, scatteredFocused: v })}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500">
                            <PulseSlider
                                labelLeft="Drained"
                                labelRight="Energized"
                                value={values.drainedEnergized}
                                onChange={(v) => setValues({ ...values, drainedEnergized: v })}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="
            group relative px-8 py-3 bg-b-sage text-white rounded-full 
            font-medium tracking-wide shadow-sm hover:shadow-md 
            transition-all duration-300 hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                >
                    <span className="relative z-10">
                        {step < 2 ? 'Next' : isSubmitting ? 'Saving...' : 'Continue'}
                    </span>
                </button>

            </div>
        </main>
    );
}

export default function PulsePage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-b-sand flex items-center justify-center">
                <p className="text-b-charcoal/60">Loading...</p>
            </main>
        }>
            <PulseContent />
        </Suspense>
    );
}
