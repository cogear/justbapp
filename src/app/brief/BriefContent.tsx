'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClusterSelector } from '@/components/news/ClusterSelector';
import { getDailySummary } from './actions';

interface BriefContentProps {
    initialSummary: string | null;
    initialCluster: string;
}

export function BriefContent({ initialSummary, initialCluster }: BriefContentProps) {
    const router = useRouter();
    const [userState, setUserState] = useState<'anxious' | 'resilient'>('anxious');
    const [dailySummary, setDailySummary] = useState<string | null>(initialSummary);
    const [currentCluster, setCurrentCluster] = useState<string>(initialCluster);

    useEffect(() => {
        // Randomly assign state for demo purposes
        setUserState(Math.random() > 0.5 ? 'resilient' : 'anxious');
    }, []);

    const handleClusterChange = async (cluster: string) => {
        setCurrentCluster(cluster);
        setDailySummary(null); // Show loading state
        const summary = await getDailySummary(cluster);
        if (summary) {
            setDailySummary(summary.content);
        } else {
            setDailySummary(null);
        }
    };

    const handleDone = () => {
        router.push('/?done=true');
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center py-12 px-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-4xl space-y-8">
                <header className="text-center space-y-6">
                    <h1 className="text-3xl font-georgia text-primary">
                        b.brief
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-wide">
                        {userState === 'anxious'
                            ? "Gentle updates for a softer world."
                            : "Direct updates for a focused mind."}
                    </p>

                    <ClusterSelector
                        currentCluster={currentCluster}
                        onClusterChange={handleClusterChange}
                    />

                    {dailySummary ? (
                        <div className="bg-secondary/20 p-8 md:p-12 rounded-[2.5rem] border border-border/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-1000 shadow-sm">
                            <p className="text-xl md:text-3xl font-georgia text-foreground/90 leading-relaxed text-center max-w-3xl mx-auto">
                                {dailySummary.replace(/\*\*/g, '')}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground animate-pulse">
                            Generating summary for {currentCluster}...
                        </div>
                    )}
                </header>

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
