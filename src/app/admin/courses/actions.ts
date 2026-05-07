'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCoursesWithLessons() {
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
