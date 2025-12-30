'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClusterSelector } from '@/components/news/ClusterSelector';
import { getDailySummary, getUserCluster } from './actions';

function BriefContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCluster = searchParams.get('cluster');

    // In a real app, we would fetch the user's latest pulse here.
    // For now, let's randomize it or default to "anxious" to show the "Solution-focused" flow.
    const [userState, setUserState] = useState<'anxious' | 'resilient'>('anxious');
    const [dailySummary, setDailySummary] = useState<string | null>(null);
    const [currentCluster, setCurrentCluster] = useState<string>("Global");

    useEffect(() => {
        // Randomly assign state for demo purposes
        setUserState(Math.random() > 0.5 ? 'resilient' : 'anxious');

        async function loadSummary() {
            let clusterToUse = selectedCluster;

            if (!clusterToUse) {
                // If no selection, fetch user's default
                clusterToUse = await getUserCluster();
            }

            if (clusterToUse) {
                setCurrentCluster(clusterToUse);
            } else {
                clusterToUse = "Global";
                setCurrentCluster("Global");
            }
            const summary = await getDailySummary(clusterToUse);
            if (summary) {
                setDailySummary(summary.content);
            } else {
                setDailySummary(null);
            }
        }

        loadSummary();
    }, [selectedCluster]);

    const handleDone = () => {
        // Navigate to "Done" state
        router.push('/?done=true');
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center py-12 px-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-lg space-y-8">
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-dynapuff text-primary">
                        b.brief
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-wide">
                        {userState === 'anxious'
                            ? "Gentle updates for a softer world."
                            : "Direct updates for a focused mind."}
                    </p>

                    <ClusterSelector currentCluster={currentCluster} />

                    {dailySummary ? (
                        <div className="bg-secondary/20 p-8 md:p-10 rounded-3xl border border-border/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-1000 shadow-sm">
                            <p className="text-xl md:text-2xl font-serif text-foreground/90 leading-relaxed text-center">
                                {dailySummary}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground animate-pulse">
                            Generating summary for {currentCluster}...
                        </div>
                    )}
                </header>

                <div className="space-y-4">
                    {/* News items removed as per request to focus on essence */}
                </div>

                <div className="flex justify-center pt-8 pb-12">
                    <button
                        onClick={handleDone}
                        className="
                            px-12 py-3 rounded-full
                            bg-primary text-primary-foreground font-medium tracking-wide
                            shadow-md hover:shadow-lg hover:bg-primary/90
                            transition-all duration-300 hover:-translate-y-0.5
                        "
                    >
                        Done
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function BriefPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        }>
            <BriefContent />
        </Suspense>
    );
}
