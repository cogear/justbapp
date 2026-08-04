'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { CheckCircle, BookOpen, ArrowLeft, ArrowRight, FileText, Lock, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCourseData, getLessonContent, getModuleLessons, markLessonComplete } from '@/app/community/course-actions';
import { getLessonComments } from '@/app/community/actions';
import { courseLandingContent } from '@/lib/course-landing-content';
import { CommentThread } from '@/components/comment-thread';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { VideoGate } from '@/components/video-gate';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface LessonCard {
    id: string;
    title: string;
    summary: string;
    order: number;
    hasVideo?: boolean;
    locked?: boolean;
}

interface LessonComment {
    id: string;
    content: string;
    createdAt: Date;
    author: { displayName: string | null; email: string };
}

interface ModuleView {
    id: string;
    title: string;
    order: number;
    summary: string;
    spaceSlug: string;
    lessons: LessonCard[];
}

export function CourseView({ spaceId, initialLessonId }: { spaceId: string; initialLessonId?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const lessonParam = searchParams.get('lesson');
    const moduleParam = searchParams.get('module');

    const [lessonContent, setLessonContent] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState<string>('');
    const [lessonVideoUrl, setLessonVideoUrl] = useState<string | null>(null);
    const [videoLocked, setVideoLocked] = useState(false);
    const [moduleData, setModuleData] = useState<ModuleView | null>(null);
    const [courseTitle, setCourseTitle] = useState<string>('');
    const [courseDescription, setCourseDescription] = useState<string>('');
    const [spaceSlug, setSpaceSlug] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [comments, setComments] = useState<LessonComment[]>([]);
    const [canComment, setCanComment] = useState(false);
    const [siblingLessons, setSiblingLessons] = useState<LessonCard[]>([]);

    const refreshComments = async () => {
        if (!lessonParam) return;
        const data = await getLessonComments(lessonParam);
        setComments(data.comments);
        setCanComment(data.isAuthenticated);
    };

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
            setLessonVideoUrl(null);
            setVideoLocked(false);
            setComments([]);
            getLessonContent(lessonParam).then(lesson => {
                if (lesson) {
                    setLessonContent(lesson.content);
                    setLessonTitle(lesson.title);
                    setLessonVideoUrl(lesson.videoUrl);
                    setVideoLocked(lesson.locked);
                }
            });
            getLessonComments(lessonParam).then(data => {
                setComments(data.comments);
                setCanComment(data.isAuthenticated);
            });
            // Neighbors for prev/next navigation
            if (moduleParam) {
                getModuleLessons(moduleParam).then(data => {
                    if (data) {
                        setSiblingLessons(data.lessons);
                        setSpaceSlug(data.spaceSlug);
                    }
                });
            }
        }
    }, [lessonParam, moduleParam]);

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

    // Lesson article view — calm reading mode
    if (lessonParam && lessonContent) {
        const currentIndex = siblingLessons.findIndex(l => l.id === lessonParam);
        const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
        const nextLesson =
            currentIndex >= 0 && currentIndex < siblingLessons.length - 1
                ? siblingLessons[currentIndex + 1]
                : null;
        const lessonHref = (id: string) =>
            `/community/${spaceSlug}?module=${moduleParam}&lesson=${id}`;

        // Where auth should drop the reader back — this exact lesson, params intact.
        const query = searchParams.toString();
        const returnTo = query ? `${pathname}?${query}` : pathname;

        return (
            <div className="max-w-2xl mx-auto px-6 pt-24 pb-20 animate-in fade-in duration-700">
                {videoLocked && (
                    <div className="mb-10 rounded-[2rem] overflow-hidden shadow-sm">
                        <VideoGate returnTo={returnTo} />
                    </div>
                )}
                {!videoLocked && lessonVideoUrl && (
                    <div className="mb-10 rounded-[2rem] overflow-hidden shadow-sm">
                        <YouTubeEmbed url={lessonVideoUrl} title={lessonTitle} />
                    </div>
                )}

                <article className="prose prose-lg dark:prose-invert prose-headings:font-georgia prose-headings:tracking-tight prose-p:leading-loose prose-p:text-foreground/85 prose-li:text-foreground/85 prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-em:text-foreground/70 max-w-none">
                    <ReactMarkdown>{lessonContent}</ReactMarkdown>
                </article>

                <div className="mt-12 pt-8 border-t border-border/40 flex items-center justify-between gap-4">
                    {!isComplete ? (
                        <button
                            onClick={handleMarkComplete}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 hover:shadow-md transition-all duration-500 flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Mark as Complete
                        </button>
                    ) : (
                        <span className="flex items-center gap-2 text-sm text-b-sage font-medium">
                            <CheckCircle size={16} />
                            Completed
                        </span>
                    )}
                </div>

                {/* Wander on: prev / next */}
                {(prevLesson || nextLesson) && (
                    <nav aria-label="Lesson navigation" className="mt-8 flex flex-col sm:flex-row gap-3">
                        {prevLesson && (
                            <Link
                                href={lessonHref(prevLesson.id)}
                                className="group flex-1 rounded-[1.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                            >
                                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                                    <ArrowLeft size={12} /> previous story
                                </span>
                                <span className="text-sm font-georgia text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {prevLesson.title}
                                </span>
                            </Link>
                        )}
                        {nextLesson && (
                            <Link
                                href={lessonHref(nextLesson.id)}
                                className="group flex-1 rounded-[1.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 text-right hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                            >
                                <span className="flex items-center justify-end gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                                    next story <ArrowRight size={12} />
                                </span>
                                <span className="text-sm font-georgia text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {nextLesson.title}
                                </span>
                            </Link>
                        )}
                    </nav>
                )}

                <div className="mt-12 pt-8 border-t border-border/40">
                    <h2 className="text-lg font-georgia mb-4">Discussion</h2>
                    <CommentThread
                        target={{ type: 'lesson', lessonId: lessonParam }}
                        comments={comments}
                        commentCount={comments.length}
                        canComment={canComment}
                        onCommentPosted={refreshComments}
                    />
                </div>
            </div>
        );
    }

    // Module card grid view
    if (moduleData) {
        const courseCopy = courseLandingContent[moduleData.spaceSlug];
        const moduleSummary = courseCopy?.moduleOverviews?.[moduleData.order] ?? moduleData.summary;
        const moduleImage = courseCopy?.moduleImages?.[moduleData.order];
        const lessonLabel = moduleData.lessons.length === 1 ? 'article' : 'articles';

        return (
            <div className="max-w-2xl mx-auto px-6 pt-24 pb-20 animate-in fade-in duration-700">
                <header className="text-center mb-10">
                    <p className="font-georgia italic text-sm text-muted-foreground/70 mb-2">
                        module {moduleData.order}
                    </p>
                    <h1 className="text-3xl md:text-4xl font-georgia text-foreground mb-4">
                        {moduleData.title}
                    </h1>
                    {moduleSummary && (
                        <p className="text-base leading-relaxed text-muted-foreground max-w-xl mx-auto mb-3">
                            {moduleSummary}
                        </p>
                    )}
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
                        {moduleData.lessons.length} {lessonLabel}
                    </p>
                </header>
                {moduleImage && (
                    <div className="relative mb-12 overflow-hidden rounded-[2.5rem] aspect-[16/6] bg-muted">
                        <Image
                            src={moduleImage.src}
                            alt={moduleImage.alt}
                            fill
                            className="object-cover brightness-[0.92]"
                            sizes="(max-width: 896px) 100vw, 896px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
                    </div>
                )}

                <ol className="space-y-3 list-none">
                    {moduleData.lessons.map((lesson, i) => (
                        <li key={lesson.id}>
                            <Link
                                href={`/community/${spaceSlug}?module=${moduleData.id}&lesson=${lesson.id}`}
                                className="group flex items-start gap-4 rounded-[1.75rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 md:p-6 hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                            >
                                <span className="font-georgia italic text-sm text-muted-foreground/50 mt-0.5 w-6 text-right shrink-0">
                                    {i + 1}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-georgia text-base leading-snug text-foreground group-hover:text-primary transition-colors">
                                        {lesson.title}
                                    </h3>
                                    {lesson.summary && (
                                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                            {lesson.summary}
                                        </p>
                                    )}
                                </div>
                                {lesson.locked ? (
                                    <Lock
                                        size={16}
                                        aria-label="Sign in to watch the video"
                                        className="text-muted-foreground/40 ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors"
                                    />
                                ) : lesson.hasVideo ? (
                                    <Video
                                        size={16}
                                        aria-label="Includes video"
                                        className="text-muted-foreground/40 ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors"
                                    />
                                ) : (
                                    <FileText
                                        size={16}
                                        className="text-muted-foreground/40 ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors"
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ol>
            </div>
        );
    }

    // No module or lesson selected (rare — the landing page handles this route)
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground px-6">
            <div className="text-center max-w-md">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-georgia mb-1">{courseTitle}</p>
                <p className="text-sm">{courseDescription}</p>
                {spaceSlug && (
                    <Link
                        href={`/community/${spaceSlug}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-4"
                    >
                        <ArrowLeft size={14} />
                        Choose a module to begin
                    </Link>
                )}
            </div>
        </div>
    );
}
