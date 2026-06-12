import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SpaceFeed } from "@/components/space-feed"
import { CourseView } from "@/components/course-view"
import { CourseLanding } from "@/components/course-landing"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic';

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
        const hasSelection = typeof query.module === 'string' || typeof query.lesson === 'string';
        if (!hasSelection) {
            return <CourseLanding spaceId={space.id} spaceSlug={space.slug} />
        }
        const lessonId = typeof query.lesson === 'string' ? query.lesson : undefined;
        return <CourseView spaceId={space.id} initialLessonId={lessonId} />
    }

    return (
        <div className="pt-24">
            <header className="text-center px-6 mb-8 animate-in fade-in duration-1000">
                <h1 className="font-georgia text-4xl md:text-5xl text-foreground mb-3">{space.name}</h1>
                {space.description && (
                    <p className="text-muted-foreground italic font-light max-w-xl mx-auto">
                        {space.description}
                    </p>
                )}
            </header>
            <SpaceFeed spaceId={space.id} />
        </div>
    )
}
