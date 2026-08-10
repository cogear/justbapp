import { cache } from 'react';
import prisma from '@/lib/prisma';

/**
 * Read queries for the course routes.
 *
 * Deliberately NOT in `app/community/course-actions.ts`: that file is
 * `'use server'`, so every export becomes a publicly callable POST endpoint.
 * Server-component reads have no reason to expand that surface.
 *
 * Everything is wrapped in React's `cache()` because `generateMetadata` and the
 * page body each need the same row — without it every render runs these joins
 * twice.
 *
 * `findFirst` rather than `findUnique`: there's no composite unique spanning the
 * space -> course -> module join, which is why `Module.slug` and `Lesson.slug`
 * each carry a single-column index.
 */

export const getCourseBySpaceSlug = cache(async (spaceSlug: string) =>
    prisma.course.findFirst({
        where: { space: { slug: spaceSlug } },
        select: {
            id: true,
            title: true,
            description: true,
            space: { select: { name: true, slug: true, description: true, imageUrl: true, type: true } },
            modules: {
                orderBy: { order: 'asc' },
                where: { lessons: { some: {} } },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    order: true,
                    updatedAt: true,
                    _count: { select: { lessons: true } },
                    lessons: { orderBy: { order: 'asc' }, take: 1, select: { content: true } },
                },
            },
        },
    })
);

export const getModuleBySlug = cache(async (spaceSlug: string, moduleSlug: string) =>
    prisma.module.findFirst({
        where: { slug: moduleSlug, course: { space: { slug: spaceSlug } } },
        select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            course: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    space: { select: { name: true, slug: true, imageUrl: true } },
                },
            },
            lessons: {
                orderBy: { order: 'asc' },
                select: { id: true, title: true, slug: true, order: true, content: true },
            },
        },
    })
);

export const getLessonBySlug = cache(
    async (spaceSlug: string, moduleSlug: string, lessonSlug: string) =>
        prisma.lesson.findFirst({
            where: {
                slug: lessonSlug,
                module: { slug: moduleSlug, course: { space: { slug: spaceSlug } } },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                order: true,
                createdAt: true,
                updatedAt: true,
                module: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        order: true,
                        course: {
                            select: {
                                title: true,
                                space: { select: { name: true, slug: true, imageUrl: true } },
                            },
                        },
                        // Siblings drive prev/next without a second query.
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: { id: true, title: true, slug: true, order: true },
                        },
                    },
                },
            },
        })
);

/**
 * Every (space, module, lesson) triple, for `generateStaticParams` on both leaf
 * routes. One query, shared via `cache()` — the module route uses a projection
 * of the same result the lesson route needs.
 */
export const getAllCoursePaths = cache(async () => {
    const spaces = await prisma.space.findMany({
        where: {
            type: 'COURSE',
            accessLevel: 'OPEN',
            courses: { some: { modules: { some: { lessons: { some: {} } } } } },
        },
        select: {
            slug: true,
            updatedAt: true,
            courses: {
                select: {
                    modules: {
                        where: { lessons: { some: {} } },
                        orderBy: { order: 'asc' },
                        select: {
                            slug: true,
                            updatedAt: true,
                            lessons: {
                                orderBy: { order: 'asc' },
                                select: { slug: true, updatedAt: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return spaces.flatMap(space =>
        space.courses.flatMap(course =>
            course.modules.map(mod => ({
                spaceSlug: space.slug,
                spaceUpdatedAt: space.updatedAt,
                moduleSlug: mod.slug,
                moduleUpdatedAt: mod.updatedAt,
                lessons: mod.lessons,
            }))
        )
    );
});
