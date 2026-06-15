import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/auth';
import * as repo from '@/lib/gatherings/data/repo';
import { GatheringsClient } from './gatherings-client';

export const dynamic = 'force-dynamic';

export default async function GatheringsPage() {
    const user = await getOrCreateUser();
    if (!user) redirect('/sign-in');

    const groups = await repo.listGroupsForUser(user.id);

    return (
        <main className="min-h-screen bg-background flex flex-col items-center px-6 py-12">
            <div className="w-full max-w-3xl space-y-8">
                <header className="space-y-2 text-center">
                    <h1 className="text-4xl font-georgia text-primary">Gatherings</h1>
                    <p className="text-muted-foreground">
                        The people you keep showing up for.
                    </p>
                </header>
                <GatheringsClient initialGroups={groups} />
            </div>
        </main>
    );
}
