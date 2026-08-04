'use server';

import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { extractSummary } from '@/lib/extract-summary';
import { isVideoLocked } from '@/lib/lesson-access';

/** Fails closed: any auth error is treated as signed-out. */
async function isSignedIn(): Promise<boolean> {
    try {
        return !!(await stackServerApp.getUser());
    } catch {
        return false;
    }
}

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
    const [mod, signedIn] = await Promise.all([
        prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        order: true,
                        videoUrl: true,
                        freePreview: true,
                    },
                },
                course: {
                    select: {
                        space: { select: { slug: true } },
                    },
                },
            },
        }),
        isSignedIn(),
    ]);

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
            hasVideo: !!l.videoUrl,
            locked: isVideoLocked({
                hasVideo: !!l.videoUrl,
                freePreview: l.freePreview,
                signedIn,
            }),
        })),
    };
}

export type LessonContentResult = {
    id: string;
    title: string;
    content: string | null;
    /** null whenever `locked` is true — a gated video's URL never crosses the wire. */
    videoUrl: string | null;
    /** True if a video exists at all, so the client can show a gate rather than nothing. */
    hasVideo: boolean;
    locked: boolean;
};

export async function getLessonContent(lessonId: string): Promise<LessonContentResult | null> {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, title: true, content: true, videoUrl: true, freePreview: true },
    });
    if (!lesson) return null;

    // Counts article reads, which are public — a gated view is still a view.
    prisma.lesson
        .update({ where: { id: lessonId }, data: { viewCount: { increment: 1 } } })
        .catch(err => console.error('Failed to increment lesson viewCount:', err));

    const hasVideo = !!lesson.videoUrl;
    const signedIn = hasVideo && !lesson.freePreview ? await isSignedIn() : false;
    const locked = isVideoLocked({ hasVideo, freePreview: lesson.freePreview, signedIn });

    return {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: locked ? null : lesson.videoUrl,
        hasVideo,
        locked,
    };
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
