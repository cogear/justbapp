import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SpaceFeed } from "@/components/space-feed"
import { CourseView } from "@/components/course-view"
import type { Metadata } from "next"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { spaceSlug } = await params;
    const space = await prisma.space.findUnique({ where: { slug: spaceSlug } });
    if (!space) return {};

    return {
        title: space.name,
        description: space.description || `Explore ${space.name} on The b. Life community.`,
        alternates: { canonical: `https://theblife.com/community/${space.slug}` },
        openGraph: {
            title: `${space.name} | b. Just Be`,
            description: space.description || `Explore ${space.name} on The b. Life community.`,
        },
    };
}

interface PageProps {
    params: Promise<{
        spaceSlug: string
    }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SpacePage({ params, searchParams }: PageProps) {
    const { spaceSlug } = await params
    const query = await searchParams

    const space = await prisma.space.findUnique({
        where: {
            slug: spaceSlug
        }
    })

    if (!space) {
        notFound()
    }

    if (space.type === 'COURSE') {
        const lessonId = typeof query.lesson === 'string' ? query.lesson : undefined;
        return <CourseView spaceId={space.id} initialLessonId={lessonId} />
    }

    return (
        <div>
            <div className="border-b p-4">
                <h1 className="text-2xl font-bold">{space.name}</h1>
                {space.description && <p className="text-muted-foreground">{space.description}</p>}
            </div>
            <SpaceFeed spaceId={space.id} />
        </div>
    )
}
