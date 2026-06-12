import prisma from '@/lib/prisma';
import { SpacePortal } from '@/components/community/space-portal';
import type { PortalCardSpace } from '@/components/community/portal-card';

export const dynamic = 'force-dynamic';

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

    return <SpacePortal spaces={portalSpaces} />;
}
