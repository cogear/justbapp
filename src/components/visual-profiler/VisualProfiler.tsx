'use client';

import React, { useState, useMemo } from 'react';
import { VisualPairCard } from './VisualPairCard';
import { PAIRS } from '@/lib/visual-profiler/data';
import { calculateProfile, getNextPair } from '@/lib/visual-profiler/engine';
import { Choice, UserProfile } from '@/lib/visual-profiler/types';
import { saveVisualProfile } from '@/app/visual-profile/actions';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

export function VisualProfiler() {
    const [showIntro, setShowIntro] = useState(true);
    const [currentPairId, setCurrentPairId] = useState<string | null>(PAIRS[0].id);
    const [choices, setChoices] = useState<Choice[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const currentPair = useMemo(() =>
        PAIRS.find(p => p.id === currentPairId),
        [currentPairId]
    );

    const handleSelect = (choice: 'A' | 'B') => {
        if (!currentPairId) return;

        const newChoices = [...choices, { pairId: currentPairId, choice }];
        setChoices(newChoices);

        const next = getNextPair(currentPairId, newChoices, PAIRS);
        if (next) {
            setCurrentPairId(next.id);
        } else {
            setIsFinished(true);
        }
    };

    const profile = useMemo(() => {
        if (!isFinished) return null;
        return calculateProfile(choices, PAIRS);
    }, [isFinished, choices]);

    const handleReset = () => {
        setChoices([]);
        setCurrentPairId(PAIRS[0].id);
        setIsFinished(false);
    };

    if (showIntro) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-1000">
                <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white dark:bg-invert rounded-[3rem] overflow-hidden shadow-2xl border border-border/40">
                    {/* Visual Side */}
                    <div className="relative hidden md:block h-full min-h-[500px]">
                        <Image
                            src="/images/hero-human.png"
                            alt="A moment of deep presence"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                    </div>

                    {/* Content Side */}
                    <div className="p-8 md:p-16 flex flex-col justify-center space-y-10 text-left">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-georgia text-primary leading-tight">Discover Your Aesthetic</h1>
                            <div className="space-y-4">
                                <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                    This experience consists of 30 sets of images designed to capture your unique perspective on the world.
                                </p>
                                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                                    For each pair, simply pick the image you relate to most. There are no wrong answers—only your truth.
                                </p>
                                <p className="text-primary font-medium italic pt-4">
                                    We really recommend doing this to get the full experience of this site.
                                </p>
                            </div>
                            <div className="p-5 bg-secondary/10 rounded-2xl text-sm text-muted-foreground italic border border-primary/5">
                                Note: This is not a diagnostic tool and is meant for demonstration purposes only.
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button
                                onClick={() => setShowIntro(false)}
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-full font-medium shadow-xl hover:shadow-2xl transition-all active:scale-95 text-lg"
                            >
                                Begin Experience
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <Link
                                href="/subscribe"
                                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Skip to Signup
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isFinished && profile) {
        return <ResultsView profile={profile} onReset={handleReset} />;
    }

    if (!currentPair) {
        return <div>Loading...</div>;
    }

    const progress = (choices.length / PAIRS.length) * 100;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl mb-8">
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-right mt-2">
                    {choices.length} / {PAIRS.length}
                </p>
            </div>

            <VisualPairCard pair={currentPair} onSelect={handleSelect} />
        </div>
    );
}

function ResultsView({ profile, onReset }: { profile: UserProfile; onReset: () => void }) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [showSignIn, setShowSignIn] = useState(false);

    const handleSave = async () => {
        setSaveStatus('saving');
        const result = await saveVisualProfile(profile);

        if (result.success) {
            setSaveStatus('saved');
        } else if (result.error === 'unauthenticated') {
            setSaveStatus('idle');
            setShowSignIn(true);
        } else {
            setSaveStatus('error');
        }
    };

    // Auto-save on mount if possible (optional, but let's stick to manual for now as per plan, or auto-try)
    // Let's try to auto-save silently.
    React.useEffect(() => {
        const autoSave = async () => {
            const result = await saveVisualProfile(profile);
            if (result.success) setSaveStatus('saved');
        };
        autoSave();
    }, [profile]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-light tracking-tight">Your Visual Profile</h1>
                    <p className="text-muted-foreground">Based on your aesthetic choices</p>
                    {saveStatus === 'saved' && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full animate-in fade-in">
                            Result Saved
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* OCEAN Traits */}
                    <div className="space-y-4 p-6 bg-card rounded-xl border border-border/50">
                        <h3 className="font-medium text-lg">Personality Traits (OCEAN)</h3>
                        <div className="space-y-3">
                            {Object.entries(profile.traits).map(([trait, score]) => (
                                <div key={trait} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{trait}</span>
                                        <span className="text-muted-foreground">{Math.round(score)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary/80"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IAB Interests */}
                    <div className="space-y-4 p-6 bg-card rounded-xl border border-border/50">
                        <h3 className="font-medium text-lg">Inferred Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.iabInterests.map((interest) => (
                                <span
                                    key={interest.id}
                                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                                >
                                    {interest.name}
                                </span>
                            ))}
                            {profile.iabInterests.length === 0 && (
                                <span className="text-muted-foreground text-sm">No strong interests detected yet.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pt-8">
                    {showSignIn ? (
                        <div className="text-center space-y-4 p-6 bg-secondary/30 rounded-xl">
                            <p className="text-sm">Sign in to save your results permanently.</p>
                            <a
                                href="/sign-in"
                                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90"
                            >
                                Sign In to Save
                            </a>
                            <button
                                onClick={() => setShowSignIn(false)}
                                className="block w-full text-xs text-muted-foreground hover:underline mt-2"
                            >
                                Maybe later
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={onReset}
                                className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:opacity-80 transition-opacity"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Start Over
                            </button>
                            {saveStatus !== 'saved' && (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                >
                                    Save Results
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
