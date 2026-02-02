import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SpaceFeed } from "@/components/space-feed"
import { CourseView } from "@/components/course-view"

interface PageProps {
    params: Promise<{
        spaceSlug: string
    }>
}

export default async function SpacePage({ params }: PageProps) {
    const { spaceSlug } = await params

    const space = await prisma.space.findUnique({
        where: {
            slug: spaceSlug
        }
    })

    if (!space) {
        notFound()
    }

    if (space.type === 'COURSE') {
        return <CourseView spaceId={space.id} />
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
