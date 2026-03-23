'use client';

import { useState } from 'react';
import { toggleLike } from '@/app/community/actions';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
    postId: string;
    likeCount: number;
    isLiked: boolean;
}

export function LikeButton({ postId, likeCount, isLiked }: LikeButtonProps) {
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const [optimisticCount, setOptimisticCount] = useState(likeCount);
    const [isPending, setIsPending] = useState(false);

    const handleClick = async () => {
        if (isPending) return;

        setIsPending(true);
        setOptimisticLiked(!optimisticLiked);
        setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);

        const result = await toggleLike(postId);
        if (result.error) {
            setOptimisticLiked(isLiked);
            setOptimisticCount(likeCount);
        }
        setIsPending(false);
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                optimisticLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Heart className={cn("h-4 w-4", optimisticLiked && "fill-current")} />
            {optimisticCount > 0 && optimisticCount}
        </button>
    );
}
