import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { SpacePortal } from '@/components/community/space-portal';
import type { PortalCardSpace } from '@/components/community/portal-card';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { ORG_ID, courseId, graph } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
    title: 'Community - Courses & Discussions',
    description:
        'Join The b. Life community. Six free courses — AI for Humans, Living with AI, The Quiet Crafts, Third Places, Private Invite Meetups, and The Comfortable Life — plus community discussions on intentional living.',
    path: '/community',
});

export default async function CommunityPage() {
    const spaces = await prisma.space.findMany({
        select: {
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            type: true,
            _count: { select: { members: true } },
            courses: {
                select: {
                    modules: { select: { _count: { select: { lessons: true } } } },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const portalSpaces: PortalCardSpace[] = spaces.map((space) => ({
        name: space.name,
        slug: space.slug,
        description: space.description,
        imageUrl: space.imageUrl,
        type: space.type,
        memberCount: space._count.members,
        lessonCount: space.courses.reduce(
            (sum, course) =>
                sum + course.modules.reduce((s, m) => s + m._count.lessons, 0),
            0
        ),
    }));

    // Built from the DB rather than the hardcoded list this used to carry in the
    // root layout — that list was emitted on every page of the site and had
    // already drifted out of date.
    const courseList = {
        '@type': 'ItemList',
        name: 'Courses',
        description:
            'Free courses on AI literacy and intentional living — plus hands-on calm, third places, gathering, and comfort',
        itemListElement: spaces
            .filter((s) => s.type === 'COURSE')
            .map((space, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'Course',
                    '@id': courseId(space.slug),
                    name: space.name,
                    url: absoluteUrl(`/community/${space.slug}`),
                    description: space.description ?? undefined,
                    provider: { '@id': ORG_ID },
                },
            })),
    };

    return (
        <>
            <JsonLd data={graph(courseList)} />
            <SpacePortal spaces={portalSpaces} />
        </>
    );
}
