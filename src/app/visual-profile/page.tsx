import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { VisualProfiler } from '@/components/visual-profiler/VisualProfiler';
import { CLUSTERS } from '@/lib/personality/clustering';

import Link from 'next/link';

export default async function VisualProfilePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        redirect('/sign-in');
    }

    const { retest } = await searchParams;
    const isRetest = retest === 'true';

    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    // If no profile exists OR retest is requested, show the profiler
    if (!user || user.visualProfiles.length === 0 || isRetest) {
        return (
            <main>
                <VisualProfiler />
            </main>
        );
    }

    const profile = user.visualProfiles[0];
    const cluster = CLUSTERS.find(c => c.name === profile.cluster) || CLUSTERS[0];

    return (
        <main className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-12">
                <header className="space-y-4 text-center">
                    <h1 className="text-4xl font-serif tracking-tight">Your Visual Profile</h1>
                    <p className="text-muted-foreground">Based on your visual preferences.</p>
                    <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto pt-2">
                        We use these insights solely to curate content that resonates with you. Your privacy is paramount—we never share or sell your data.
                    </p>
                </header>

                {/* Personality Cluster */}
                <section className="bg-card border border-border/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                        Personality Archetype
                    </div>
                    <h2 className="text-3xl font-serif text-foreground">{profile.cluster || 'Analyzing...'}</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
                        {cluster.description}
                    </p>
                </section>

                {/* OCEAN Scores */}
                <div className="grid gap-6">
                    <ScoreCard label="Openness" score={profile.openness} description="Curiosity & Creativity" />
                    <ScoreCard label="Conscientiousness" score={profile.conscientiousness} description="Organization & Discipline" />
                    <ScoreCard label="Extraversion" score={profile.extraversion} description="Social Energy" />
                    <ScoreCard label="Agreeableness" score={profile.agreeableness} description="Cooperation & Empathy" />
                    <ScoreCard label="Neuroticism" score={profile.neuroticism} description="Emotional Sensitivity" />
                </div>

                <div className="text-center pt-8">
                    <p className="text-sm text-muted-foreground mb-4">
                        Want to update your profile?
                    </p>
                    <Link
                        href="/visual-profile?retest=true"
                        className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
                    >
                        Retake Visual Test
                    </Link>
                </div>
            </div>
        </main>
    );
}

function ScoreCard({ label, score, description }: { label: string, score: number, description: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
                <h3 className="font-medium">{label}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                </div>
                <span className="font-mono text-sm w-8 text-right">{score}</span>
            </div>
        </div>
    );
}
