import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import { getTopStories } from '@/lib/news/service';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ClusterSelector } from '@/components/news/ClusterSelector';
import { redirect } from 'next/navigation';

export default async function NewsPage(props: { searchParams: Promise<{ cluster?: string }> }) {
    const searchParams = await props.searchParams;
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        redirect('/sign-in');
    }

    // Fetch user profile to get default cluster
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    const defaultCluster = user?.visualProfiles[0]?.cluster || 'Average';
    const activeCluster = searchParams.cluster || defaultCluster;

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
                    <div className="space-y-2">
                        <h1 className="text-4xl font-serif tracking-tight">Your Daily Briefing</h1>
                        <p className="text-muted-foreground">
                            Curated for your <span className="font-medium text-foreground">{activeCluster}</span> lens.
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
