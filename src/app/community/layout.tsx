import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AmbientBackdrop } from '@/components/community/ambient-backdrop';
import { CommunityBreadcrumb } from '@/components/community/community-breadcrumb';

export const dynamic = 'force-dynamic';

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
                        select: { id: true, title: true, order: true },
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

    const spaceTypes = Object.fromEntries(spaces.map((s) => [s.slug, s.type]));
    const breadcrumbSpaces = spaces.map((s) => ({
        name: s.name,
        slug: s.slug,
        type: s.type,
        modules: s.courses.flatMap((c) => c.modules.map((m) => ({ id: m.id, title: m.title }))),
    }));

    return (
        <div className="relative min-h-screen">
            <Suspense>
                <AmbientBackdrop spaceTypes={spaceTypes} />
            </Suspense>
            <Suspense>
                <CommunityBreadcrumb spaces={breadcrumbSpaces} />
            </Suspense>
            <main className="relative">{children}</main>
        </div>
    );
}
