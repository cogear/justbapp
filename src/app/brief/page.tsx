import React, { Suspense } from 'react';
import { getDailySummary, getUserCluster } from './actions';
import { BriefContent } from './BriefContent';
import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = noindexMetadata("Brief");

export default async function BriefPage({ searchParams }: { searchParams: { cluster?: string } }) {
    const params = await searchParams;
    const clusterFromUrl = params.cluster;

    // Fetch user's personality cluster
    const userCluster = await getUserCluster();

    // Determine which cluster to show
    const initialCluster = clusterFromUrl || userCluster || "Global";

    // Fetch initial summary server-side
    const summary = await getDailySummary(initialCluster);
    const initialSummaryContent = summary ? summary.content : null;

    return (
        <Suspense fallback={
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Entering the b.brief...</p>
            </main>
        }>
            <BriefContent
                initialSummary={initialSummaryContent}
                initialCluster={initialCluster}
            />
        </Suspense>
    );
}
