import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import { getTopStories } from '@/lib/news/service';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ClusterSelector } from '@/components/news/ClusterSelector';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const stackUser = await stackServerApp.getUser();
    const { cluster } = await searchParams;

    if (!stackUser) {
        redirect('/sign-in');
    }

    // Fetch user profile from DB
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    // Get user's profile to determine default cluster
    const defaultCluster = user?.visualProfiles?.[0]?.cluster || 'Balanced';
    const activeCluster = (typeof cluster === 'string' ? cluster : undefined) || defaultCluster;

    // Fetch personalized news
    let stories = [];
    let error = null;

    try {
        stories = await getTopStories(activeCluster);
    } catch (e) {
        console.error('Error loading news:', e);
        error = 'Failed to load news. Please try again later.';
    }

    return (
        <main className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-6 text-center">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <span className="px-4 py-1.5 bg-primary/5 text-primary text-[11px] uppercase tracking-[0.2em] font-bold rounded-full border border-primary/10 shadow-sm">
                                {activeCluster} Lens
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif tracking-tight font-bold">Your Daily Briefing</h1>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            A curated perspective on the world, refined for your specific personality and values.
                        </p>
                    </div>

                    <ClusterSelector currentCluster={activeCluster} />
                </header>

                {error ? (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                ) : (
                    <NewsFeed articles={stories} />
                )}
            </div>
        </main>
    );
}
