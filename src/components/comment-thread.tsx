'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createComment, createLessonComment } from '@/app/community/actions';
import { MessageCircle } from 'lucide-react';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        displayName: string | null;
        email: string;
    };
}

type Target =
    | { type: 'post'; postId: string }
    | { type: 'lesson'; lessonId: string };

interface CommentThreadProps {
    target: Target;
    comments: Comment[];
    commentCount: number;
    canComment?: boolean;
    onCommentPosted?: () => void | Promise<void>;
}

export function CommentThread({
    target,
    comments,
    commentCount,
    canComment = true,
    onCommentPosted,
}: CommentThreadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError('');
        try {
            const result =
                target.type === 'post'
                    ? await createComment(content, target.postId)
                    : await createLessonComment(content, target.lessonId);
            if (result.success) {
                setContent('');
                if (onCommentPosted) await onCommentPosted();
            } else {
                setError(result.error || 'Failed to post comment');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <MessageCircle className="h-4 w-4" />
                {commentCount === 0 ? 'Comment' : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
            </button>

            {isOpen && (
                <div className="mt-3 space-y-3">
                    {comments.length > 0 && (
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                            {comments.map((comment) => (
                                <div key={comment.id} className="text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold">
                                            {(comment.author.displayName || comment.author.email)?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <span className="font-medium text-sm">
                                            {comment.author.displayName || comment.author.email || 'User'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-card-foreground whitespace-pre-wrap pl-8">
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {canComment ? (
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-muted/50 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? '...' : 'Reply'}
                            </Button>
                        </form>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            <Link href="/handler/sign-in" className="text-primary hover:underline underline-offset-4">
                                Sign in
                            </Link>{' '}
                            to join the conversation.
                        </p>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
            )}
        </div>
    );
}
