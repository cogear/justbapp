import { CommunitySidebar } from '@/components/community-sidebar';
import prisma from '@/lib/prisma';

async function getSpaces() {
    return prisma.space.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
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
            <CommunitySidebar spaces={spaces} />
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header would go here */}
                {children}
            </main>
        </div>
    );
}
