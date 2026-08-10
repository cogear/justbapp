'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getLessonContent, markLessonComplete, recordLessonView } from '@/app/community/course-actions';
import { getLessonComments } from '@/app/community/actions';
import { CommentThread } from '@/components/comment-thread';
import { YouTubeEmbed } from '@/components/youtube-embed';

/**
 * The two parts of a lesson page that depend on *who is viewing*, split so they
 * can sit on either side of the server-rendered prose.
 *
 * They exist as client islands so the page itself never touches
 * `cookies()`/`getUser()` — either of which would make the route dynamic and
 * silently disable its ISR.
 */

interface LessonComment {
    id: string;
    content: string;
    createdAt: Date;
    author: { displayName: string | null; email: string };
}

/**
 * Renders above the article.
 *
 * The video URL deliberately comes from the `getLessonContent` server action
 * rather than being passed in as a prop. That action is where access rules for
 * video live (see the `freePreview` work on feat/gate-course-videos), so routing
 * the player through it keeps the URL server-controlled: gating applies
 * automatically and a locked lesson never leaks its videoUrl into the page
 * source. The prose stays server-rendered either way, which is the SEO surface.
 *
 * This is also where the view is counted — under ISR the page body renders about
 * once an hour, so a server-side increment would undercount by orders of
 * magnitude and mostly measure crawl rate.
 */
export function LessonVideo({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getLessonContent(lessonId).then(lesson => {
            if (!cancelled) setVideoUrl(lesson?.videoUrl ?? null);
        });

        // sessionStorage keeps back-navigation from double-counting. No
        // revalidatePath — that would invalidate the ISR entry on every pageview.
        const seenKey = `lesson-view:${lessonId}`;
        try {
            if (!sessionStorage.getItem(seenKey)) {
                sessionStorage.setItem(seenKey, '1');
                recordLessonView(lessonId);
            }
        } catch {
            // Private browsing / storage disabled — not worth failing over.
            recordLessonView(lessonId);
        }

        return () => {
            cancelled = true;
        };
    }, [lessonId]);

    if (!videoUrl) return null;

    return (
        <div className="mb-10 rounded-[2rem] overflow-hidden shadow-sm">
            <YouTubeEmbed url={videoUrl} title={lessonTitle} />
        </div>
    );
}

/** Renders below the article: completion state and the discussion thread. */
export function LessonFooter({ lessonId }: { lessonId: string }) {
    const [isComplete, setIsComplete] = useState(false);
    const [comments, setComments] = useState<LessonComment[]>([]);
    const [canComment, setCanComment] = useState(false);

    const refreshComments = useCallback(async () => {
        const data = await getLessonComments(lessonId);
        setComments(data.comments);
        setCanComment(data.isAuthenticated);
    }, [lessonId]);

    useEffect(() => {
        refreshComments();
    }, [refreshComments]);

    async function handleMarkComplete() {
        const result = await markLessonComplete(lessonId);
        if (result.success) {
            toast.success('Lesson marked as complete');
            setIsComplete(true);
        } else {
            toast.error(result.error || 'Failed to mark complete');
        }
    }

    return (
        <>
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

            <div className="mt-12 pt-8 border-t border-border/40">
                <h2 className="text-lg font-georgia mb-4">Discussion</h2>
                <CommentThread
                    target={{ type: 'lesson', lessonId }}
                    comments={comments}
                    commentCount={comments.length}
                    canComment={canComment}
                    onCommentPosted={refreshComments}
                />
            </div>
        </>
    );
}
