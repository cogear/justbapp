import { notFound, permanentRedirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { SpaceFeed } from "@/components/space-feed"
import { CourseLanding } from "@/components/course-landing"
import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"
import { lessonPath, modulePath } from "@/lib/courses/paths"

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { spaceSlug } = await params;
    const space = await prisma.space.findUnique({ where: { slug: spaceSlug } });
    if (!space) return {};

    const description = space.description || `Explore ${space.name} on The b. Life community.`;

    // FEED spaces are thin member-generated discussion threads and posting
    // requires auth — keep them out of the index, but `follow` so links out to
    // the courses and member pages they reference still carry equity.
    if (space.type !== 'COURSE') {
        return buildMetadata({
            title: space.name,
            description,
            path: `/community/${space.slug}`,
            noindex: true,
            follow: true,
        });
    }

    return buildMetadata({
        title: space.name,
        description,
        path: `/community/${space.slug}`,
        image: { url: space.imageUrl || `/images/community/cards/${space.slug}.png` },
    });
}

interface PageProps {
    params: Promise<{
        spaceSlug: string
    }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Lessons and modules used to be query parameters on this route
 * (?module=<uuid>&lesson=<uuid>). Those URLs are in Google's index, in
 * bookmarks, and wherever anyone has shared one, so translate them to the
 * path-based equivalent permanently rather than 404ing.
 *
 * Done here rather than in middleware because the uuid -> slug mapping needs a
 * database lookup, and middleware runs on the Edge runtime where Prisma isn't
 * available. Note `permanentRedirect` emits 308, not 301 — Google consolidates
 * both identically.
 */
async function redirectLegacyUrl(query: Record<string, string | string[] | undefined>) {
    const lessonId = typeof query.lesson === 'string' && UUID.test(query.lesson) ? query.lesson : null
    const moduleId = typeof query.module === 'string' && UUID.test(query.module) ? query.module : null

    if (lessonId) {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                slug: true,
                module: {
                    select: { slug: true, course: { select: { space: { select: { slug: true } } } } },
                },
            },
        })
        // Resolve against the lesson's own space, which also repairs links that
        // named the wrong one.
        if (lesson) {
            permanentRedirect(
                lessonPath(lesson.module.course.space.slug, lesson.module.slug, lesson.slug)
            )
        }
    }

    if (moduleId) {
        const mod = await prisma.module.findUnique({
            where: { id: moduleId },
            select: { slug: true, course: { select: { space: { select: { slug: true } } } } },
        })
        if (mod) {
            permanentRedirect(modulePath(mod.course.space.slug, mod.slug))
        }
    }

    // Unknown or stale ids fall through to the course landing page — a soft
    // landing for an old bookmark beats a dead end.
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
        await redirectLegacyUrl(query)
        return (
            <CourseLanding
                spaceId={space.id}
                spaceSlug={space.slug}
                spaceName={space.name}
                spaceImageUrl={space.imageUrl}
            />
        )
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
