import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import { getTopStories } from '@/lib/news/service';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ClusterSelector } from '@/components/news/ClusterSelector';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

console.log('[NewsPage Module] Loaded.');

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    console.log('[NewsPage] Starting render...');
    const stackUser = await stackServerApp.getUser();
    console.log('[NewsPage] Stack user fetched:', stackUser?.id);
    const { cluster } = await searchParams;

    if (!stackUser) {
        console.log('[NewsPage] No user, redirecting...');
        redirect('/sign-in');
    }

    // Fetch user profile from DB
    console.log('[NewsPage] Fetching DB user...');
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
        include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    console.log('[NewsPage] DB user fetched:', user?.id);

    // Get user's profile to determine default cluster
    const defaultCluster = user?.visualProfiles?.[0]?.cluster || 'Average';
    const activeCluster = (typeof cluster === 'string' ? cluster : undefined) || defaultCluster;

    // Fetch personalized news
    let stories = [];
    let error = null;

    try {
        console.log('[NewsPage] Calling getTopStories...');
        stories = await getTopStories(activeCluster);
        console.log('[NewsPage] getTopStories returned:', stories.length);
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
