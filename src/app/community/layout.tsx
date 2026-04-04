import { CommunitySidebar } from '@/components/community-sidebar';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Community - Courses & Discussions",
    description: "Join The b. Life community. Access free courses on AI for Humans and Living with AI, plus community discussions on intentional living.",
    alternates: { canonical: "https://theblife.com/community" },
};

async function getSpaces() {
    return prisma.space.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            courses: {
                select: {
                    id: true,
                    modules: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            order: true,
                            lessons: {
                                orderBy: { order: 'asc' },
                                select: { id: true, title: true, order: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}

export default async function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const spaces = await getSpaces();

    return (
        <div className="flex min-h-screen">
            <Suspense>
                <CommunitySidebar spaces={spaces} />
            </Suspense>
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header would go here */}
                {children}
            </main>
        </div>
    );
}
