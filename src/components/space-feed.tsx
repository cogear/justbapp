import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { CreatePostForm } from './create-post-form';
import { CommentThread } from './comment-thread';
import { LikeButton } from './like-button';

export async function SpaceFeed({ spaceId }: { spaceId: string }) {
    const stackUser = await stackServerApp.getUser();
    let currentUserId: string | null = null;

    if (stackUser?.primaryEmail) {
        const dbUser = await prisma.user.findUnique({
            where: { email: stackUser.primaryEmail },
            select: { id: true },
        });
        currentUserId = dbUser?.id ?? null;
    }

    const posts = await prisma.post.findMany({
        where: { spaceId },
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            comments: {
                include: { author: { select: { displayName: true, email: true } } },
                orderBy: { createdAt: 'asc' },
            },
            likes: currentUserId
                ? { where: { userId: currentUserId }, select: { id: true } }
                : false,
            _count: { select: { comments: true, likes: true } },
        }
    });

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                <CreatePostForm spaceId={spaceId} />

                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">No posts yet. Be the first!</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-card rounded-lg border p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                                        {(post.author.displayName || post.author.email)?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="font-medium">{post.author.displayName || post.author.email || 'User'}</div>
                                        <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <LikeButton
                                        postId={post.id}
                                        likeCount={post._count.likes}
                                        isLiked={Array.isArray(post.likes) && post.likes.length > 0}
                                    />
                                    <CommentThread
                                        postId={post.id}
                                        comments={post.comments}
                                        commentCount={post._count.comments}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
