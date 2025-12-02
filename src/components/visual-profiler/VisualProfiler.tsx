'use client';

import React, { useState, useMemo } from 'react';
import { VisualPairCard } from './VisualPairCard';
import { PAIRS } from '@/lib/visual-profiler/data';
import { calculateProfile, getNextPair } from '@/lib/visual-profiler/engine';
import { Choice, UserProfile } from '@/lib/visual-profiler/types';
import { saveVisualProfile } from '@/app/visual-profile/actions';
import { ArrowRight, RefreshCcw } from 'lucide-react';

export function VisualProfiler() {
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
