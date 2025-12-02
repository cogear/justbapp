'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InsightCard from '@/components/InsightCard';
import { saveInsight } from '@/app/pulse/actions';
import { InsightQuestion } from '@/lib/insight-questions';

interface InsightContentProps {
    initialQuestion: InsightQuestion | null;
}

export default function InsightContent({ initialQuestion }: InsightContentProps) {
    const router = useRouter();

    const handleRelease = async (answer: string) => {
        if (initialQuestion) {
            await saveInsight(initialQuestion.text, answer, initialQuestion.id);
        }
        // Navigate to "Brief"
        router.push('/brief');
    };

    if (!initialQuestion) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">All caught up!</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-opacity duration-1000 animate-in fade-in">
            <div className="w-full max-w-lg">
                <header className="mb-12 text-center">
                    <h1 className="text-3xl font-dynapuff text-primary">
                        b.insight
                    </h1>
                </header>

                <InsightCard
                    question={initialQuestion.text}
                    type={initialQuestion.type}
                    options={initialQuestion.options}
                    onRelease={handleRelease}
                />
            </div>
        </main>
    );
}
