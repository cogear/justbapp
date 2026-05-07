'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { extractSummary } from '@/lib/extract-summary';

export async function getCourseData(spaceId: string) {
    const course = await prisma.course.findFirst({
        where: { spaceId },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        select: { id: true, title: true, order: true },
                    },
                },
            },
        },
    });

    if (!course) return null;

    // Get user's progress if logged in
    let completedLessonIds: Set<string> = new Set();
    try {
        const user = await stackServerApp.getUser();
        if (user) {
            const progress = await prisma.lessonProgress.findMany({
                where: { userId: user.id, completed: true },
                select: { lessonId: true },
            });
            completedLessonIds = new Set(progress.map(p => p.lessonId));
        }
    } catch {}

    return {
        id: course.id,
        title: course.title,
        description: course.description,
        modules: course.modules.map(mod => ({
            id: mod.id,
            title: mod.title,
            order: mod.order,
            lessons: mod.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order,
                completed: completedLessonIds.has(lesson.id),
            })),
        })),
    };
}

export async function getCourseLandingData(spaceId: string) {
    const course = await prisma.course.findFirst({
        where: { spaceId },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        take: 1,
                        select: { content: true },
                    },
                    _count: { select: { lessons: true } },
                },
            },
        },
    });

    if (!course) return null;

    return {
        id: course.id,
        title: course.title,
        description: course.description,
        modules: course.modules.map(mod => ({
            id: mod.id,
            title: mod.title,
            order: mod.order,
            lessonCount: mod._count.lessons,
            firstLessonSummary: extractSummary(mod.lessons[0]?.content ?? null),
        })),
    };
}

export async function getModuleLessons(moduleId: string) {
    const mod = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
            lessons: {
                orderBy: { order: 'asc' },
                select: { id: true, title: true, content: true, order: true },
            },
            course: {
                select: {
                    space: { select: { slug: true } },
                },
            },
        },
    });

    if (!mod) return null;

    return {
        id: mod.id,
        title: mod.title,
        order: mod.order,
        summary: extractSummary(mod.lessons[0]?.content ?? null),
        spaceSlug: mod.course.space.slug,
        lessons: mod.lessons.map(l => ({
            id: l.id,
            title: l.title,
            summary: extractSummary(l.content),
            order: l.order,
        })),
    };
}

export async function getLessonContent(lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, title: true, content: true, videoUrl: true },
    });
    if (lesson) {
        prisma.lesson
            .update({ where: { id: lessonId }, data: { viewCount: { increment: 1 } } })
            .catch(err => console.error('Failed to increment lesson viewCount:', err));
    }
    return lesson;
}

export async function markLessonComplete(lessonId: string) {
    const user = await stackServerApp.getUser();
    if (!user) return { success: false, error: 'Not logged in' };

    try {
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: { userId: user.id, lessonId },
            },
            update: { completed: true, completedAt: new Date() },
            create: {
                userId: user.id,
                lessonId,
                completed: true,
                completedAt: new Date(),
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to mark lesson complete:', error);
        return { success: false, error: 'Failed to update progress' };
    }
}
