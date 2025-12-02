import React, { Suspense } from 'react';
import { getNextQuestion } from '@/app/pulse/actions';
import InsightContent from './InsightContent';

export default async function InsightPage() {
    const question = await getNextQuestion();

    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        }>
            <InsightContent initialQuestion={question} />
        </Suspense>
    );
}
