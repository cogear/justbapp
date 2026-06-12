'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPost } from '@/app/community/actions';

export function CreatePostForm({ spaceId }: { spaceId: string }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError('');
        try {
            const result = await createPost(content, spaceId);
            if (result.success) {
                setContent('');
            } else {
                setError(result.error || 'Failed to create post');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] bg-secondary/10 backdrop-blur-md border border-border/30 p-6 shadow-sm mb-8 focus-within:bg-secondary/20 transition-colors duration-500"
        >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="share a thought…"
                className="w-full bg-transparent outline-none text-lg resize-none min-h-[80px] placeholder:italic placeholder:font-light placeholder:text-muted-foreground/60"
            />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            <div className="flex justify-end mt-4">
                <Button type="submit" disabled={isSubmitting} className="rounded-full px-6">
                    {isSubmitting ? 'Sharing…' : 'Share'}
                </Button>
            </div>
        </form>
    );
}
