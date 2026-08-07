import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import { AmbientBackdrop } from '@/components/community/ambient-backdrop';
import { CommunityBreadcrumb } from '@/components/community/community-breadcrumb';

// NOTE: deliberately no `export const dynamic = 'force-dynamic'` here. Route
// segment config on a *layout* cascades to every nested segment, so it would
// silently disable generateStaticParams + revalidate on the module and lesson
// routes — no error, no warning, just 592 pages hitting the database per
// request. The layout's own query is cheap and cached.
//
// NOTE: no `metadata` export here either. Layout metadata — especially a canonical — is
// inherited by every nested segment, which would make each course, module, and
// lesson page declare itself a duplicate of /community. The community index's
// own metadata lives in ./page.tsx.

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
                        select: { id: true, slug: true, title: true, order: true },
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
        modules: s.courses.flatMap((c) => c.modules.map((m) => ({ slug: m.slug, title: m.title }))),
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
