'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, BookOpen, ArrowLeft, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCourseData, getLessonContent, getModuleLessons, markLessonComplete } from '@/app/community/course-actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface LessonCard {
    id: string;
    title: string;
    summary: string;
    order: number;
}

interface ModuleView {
    id: string;
    title: string;
    spaceSlug: string;
    lessons: LessonCard[];
}

export function CourseView({ spaceId, initialLessonId }: { spaceId: string; initialLessonId?: string }) {
    const searchParams = useSearchParams();
    const lessonParam = searchParams.get('lesson');
    const moduleParam = searchParams.get('module');

    const [lessonContent, setLessonContent] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState<string>('');
    const [moduleData, setModuleData] = useState<ModuleView | null>(null);
    const [courseTitle, setCourseTitle] = useState<string>('');
    const [courseDescription, setCourseDescription] = useState<string>('');
    const [spaceSlug, setSpaceSlug] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        getCourseData(spaceId).then(data => {
            if (data) {
                setCourseTitle(data.title);
                setCourseDescription(data.description || '');
                // Get slug from URL
                const path = window.location.pathname;
                const match = path.match(/\/community\/([^/]+)/);
                if (match) setSpaceSlug(match[1]);
            }
            setLoading(false);
        });
    }, [spaceId]);

    // Handle lesson view
    useEffect(() => {
        if (lessonParam) {
            setModuleData(null);
            setLessonContent(null);
            getLessonContent(lessonParam).then(lesson => {
                if (lesson) {
                    setLessonContent(lesson.content);
                    setLessonTitle(lesson.title);
                }
            });
        }
    }, [lessonParam]);

    // Handle module view
    useEffect(() => {
        if (moduleParam && !lessonParam) {
            setLessonContent(null);
            setModuleData(null);
            getModuleLessons(moduleParam).then(data => {
                if (data) {
                    setModuleData(data);
                    setSpaceSlug(data.spaceSlug);
                }
            });
        }
    }, [moduleParam, lessonParam]);

    async function handleMarkComplete() {
        if (!lessonParam) return;
        const result = await markLessonComplete(lessonParam);
        if (result.success) {
            toast.success('Lesson marked as complete');
            setIsComplete(true);
        } else {
            toast.error(result.error || 'Failed to mark complete');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
                Loading course...
            </div>
        );
    }

    // Lesson article view
    if (lessonParam && lessonContent) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                {moduleParam && (
                    <Link
                        href={`/community/${spaceSlug}?module=${moduleParam}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to articles
                    </Link>
                )}

                <article className="prose prose-lg dark:prose-invert prose-headings:font-georgia prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-foreground/85 prose-li:text-foreground/85 prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-em:text-foreground/70 max-w-none">
                    <ReactMarkdown>{lessonContent}</ReactMarkdown>
                </article>

                <div className="mt-12 pt-6 border-t border-border">
                    {!isComplete ? (
                        <button
                            onClick={handleMarkComplete}
                            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Mark as Complete
                        </button>
                    ) : (
                        <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle size={16} />
                            Completed
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Module card grid view
    if (moduleData) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-georgia font-bold mb-2">{moduleData.title}</h1>
                <p className="text-sm text-muted-foreground mb-8">{moduleData.lessons.length} articles</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {moduleData.lessons.map(lesson => (
                        <Link
                            key={lesson.id}
                            href={`/community/${spaceSlug}?module=${moduleData.id}&lesson=${lesson.id}`}
                            className="group block p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <FileText size={18} className="text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                                        {lesson.title}
                                    </h3>
                                    {lesson.summary && (
                                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                            {lesson.summary}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    // Course landing (no module or lesson selected)
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
            <div className="text-center">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">{courseTitle}</p>
                <p className="text-sm">{courseDescription}</p>
                <p className="text-sm mt-4">Select a category from the sidebar to begin</p>
            </div>
        </div>
    );
}
