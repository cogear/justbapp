import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SpacePortal } from '@/components/community/space-portal';
import type { PortalCardSpace } from '@/components/community/portal-card';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
    title: 'Community - Discussion Spaces',
    description:
        'Join The b. Life community — open discussion spaces for introductions and everyday conversation about intentional living. The six free courses have their own home at b.courses.',
    path: '/community',
});

export default async function CommunityPage() {
    // The portal shows discussion spaces only. Courses moved to /courses, which
    // also carries the Course ItemList JSON-LD that used to live on this page.
    const spaces = await prisma.space.findMany({
        where: { type: 'FEED' },
        select: {
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            type: true,
            _count: { select: { members: true } },
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
        lessonCount: 0,
    }));

    return (
        <>
            <SpacePortal spaces={portalSpaces} />
            <div className="text-center pb-24 -mt-8">
                <p className="text-muted-foreground italic font-light">
                    looking for the courses? they have their own shelf now —{' '}
                    <Link
                        href="/courses"
                        className="font-georgia not-italic text-foreground hover:text-primary underline decoration-border underline-offset-4 transition-colors"
                    >
                        b.courses
                    </Link>
                </p>
            </div>
        </>
    );
}
