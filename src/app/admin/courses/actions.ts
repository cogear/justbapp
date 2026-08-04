'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin';

export async function getCoursesWithLessons() {
    if (!(await isAdmin())) return [];

    const courses = await prisma.course.findMany({
        orderBy: { title: 'asc' },
        include: {
            space: { select: { slug: true } },
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            order: true,
                            videoUrl: true,
                            viewCount: true,
                            freePreview: true,
                        },
                    },
                },
            },
        },
    });

    return courses.map(c => ({
        id: c.id,
        title: c.title,
        spaceSlug: c.space.slug,
        modules: c.modules.map(m => ({
            id: m.id,
            title: m.title,
            order: m.order,
            lessons: m.lessons,
        })),
    }));
}

export async function setLessonVideoUrl(lessonId: string, videoUrl: string) {
    if (!(await isAdmin())) return { success: false, error: 'Not authorized' };

    const trimmed = videoUrl.trim();
    try {
        await prisma.lesson.update({
            where: { id: lessonId },
            data: { videoUrl: trimmed === '' ? null : trimmed },
        });
        revalidatePath('/admin/courses');
        return { success: true };
    } catch (error) {
        console.error('Failed to update videoUrl:', error);
        return { success: false, error: 'Failed to save' };
    }
}

/** Opens a lesson's video to signed-out visitors, or gates it again. */
export async function setLessonFreePreview(lessonId: string, freePreview: boolean) {
    if (!(await isAdmin())) return { success: false, error: 'Not authorized' };

    try {
        await prisma.lesson.update({
            where: { id: lessonId },
            data: { freePreview },
        });
        revalidatePath('/admin/courses');
        return { success: true };
    } catch (error) {
        console.error('Failed to update freePreview:', error);
        return { success: false, error: 'Failed to save' };
    }
}
