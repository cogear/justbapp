'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCourseData, getLessonContent, markLessonComplete } from '@/app/community/course-actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface LessonMeta {
    id: string;
    title: string;
    order: number;
    completed: boolean;
}

interface ModuleData {
    id: string;
    title: string;
    order: number;
    lessons: LessonMeta[];
}

interface CourseData {
    id: string;
    title: string;
    description: string | null;
    modules: ModuleData[];
}

export function CourseView({ spaceId, initialLessonId }: { spaceId: string; initialLessonId?: string }) {
    const searchParams = useSearchParams();
    const [course, setCourse] = useState<CourseData | null>(null);
    const [lessonContent, setLessonContent] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId || null);
    const [loading, setLoading] = useState(true);

    // Load course data
    useEffect(() => {
        getCourseData(spaceId).then(data => {
            setCourse(data);
            const lessonParam = searchParams.get('lesson');
            const targetId = lessonParam || initialLessonId || data?.modules[0]?.lessons[0]?.id;
            if (targetId) {
                loadLesson(targetId);
            }
            setLoading(false);
        });
    }, [spaceId]);

    // React to lesson param changes from sidebar navigation
    useEffect(() => {
        const lessonParam = searchParams.get('lesson');
        if (lessonParam && lessonParam !== activeLessonId) {
            loadLesson(lessonParam);
        }
    }, [searchParams]);

    async function loadLesson(lessonId: string) {
        setActiveLessonId(lessonId);
        setLessonContent(null);
        const lesson = await getLessonContent(lessonId);
        if (lesson) {
            setLessonContent(lesson.content);
        }
    }

    async function handleMarkComplete() {
        if (!activeLessonId) return;
        const result = await markLessonComplete(activeLessonId);
        if (result.success) {
            toast.success('Lesson marked as complete');
            setCourse(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    modules: prev.modules.map(mod => ({
                        ...mod,
                        lessons: mod.lessons.map(l =>
                            l.id === activeLessonId ? { ...l, completed: true } : l
                        ),
                    })),
                };
            });
        } else {
            toast.error(result.error || 'Failed to mark complete');
        }
    }

    function getNextLesson(): LessonMeta | null {
        if (!course || !activeLessonId) return null;
        const allLessons = course.modules.flatMap(m => m.lessons);
        const idx = allLessons.findIndex(l => l.id === activeLessonId);
        return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
    }

    function getSpaceSlug(): string {
        // Extract from URL
        const path = window.location.pathname;
        const match = path.match(/\/community\/([^/]+)/);
        return match?.[1] || '';
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                Loading course...
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                Course not found.
            </div>
        );
    }

    const currentLesson = course.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId);
    const nextLesson = getNextLesson();
    const slug = getSpaceSlug();

    if (!lessonContent) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                <div className="text-center">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-1">{course.title}</p>
                    <p className="text-sm">{course.description}</p>
                    <p className="text-sm mt-4">Select a lesson from the sidebar to begin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <article className="prose prose-lg dark:prose-invert prose-headings:font-georgia prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/85 prose-li:text-foreground/85 prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-em:text-foreground/70 max-w-none">
                <ReactMarkdown>{lessonContent}</ReactMarkdown>
            </article>

            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
                {currentLesson && !currentLesson.completed ? (
                    <button
                        onClick={handleMarkComplete}
                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
                    >
                        <CheckCircle size={16} />
                        Mark as Complete
                    </button>
                ) : currentLesson?.completed ? (
                    <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle size={16} />
                        Completed
                    </span>
                ) : <div />}

                {nextLesson && (
                    <Link
                        href={`/community/${slug}?lesson=${nextLesson.id}`}
                        className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                    >
                        Next: {nextLesson.title}
                    </Link>
                )}
            </div>
        </div>
    );
}
