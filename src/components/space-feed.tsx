import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { CreatePostForm } from './create-post-form';
import { CommentThread } from './comment-thread';
import { LikeButton } from './like-button';
import { MessageUserButton } from './messages/message-user-button';
import { InviteMemberForm } from './messages/invite-member-form';

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
        <div className="px-6 pb-20">
            <div className="max-w-2xl mx-auto">
                {currentUserId && (
                    <div className="mb-6 flex justify-center">
                        <InviteMemberForm spaceId={spaceId} />
                    </div>
                )}
                <CreatePostForm spaceId={spaceId} />

                <div className="space-y-5">
                    {posts.length === 0 ? (
                        <div className="text-center text-muted-foreground italic font-light py-16">
                            nothing here yet. say something unhurried.
                        </div>
                    ) : (
                        posts.map((post, i) => (
                            <div
                                key={post.id}
                                className="rounded-[2rem] bg-secondary/15 backdrop-blur-md border border-border/30 p-6 md:p-7 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700"
                                style={{
                                    animationDelay: `${Math.min(i, 6) * 100}ms`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-b-sage/20 flex items-center justify-center text-b-sage font-georgia">
                                        {(post.author.displayName || post.author.email)?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="font-medium flex items-center gap-1.5">
                                            {post.author.displayName || post.author.email || 'User'}
                                            {currentUserId && post.author.id !== currentUserId && (
                                                <MessageUserButton userId={post.author.id} />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                <div className="flex items-center gap-4 mt-5">
                                    <LikeButton
                                        postId={post.id}
                                        likeCount={post._count.likes}
                                        isLiked={Array.isArray(post.likes) && post.likes.length > 0}
                                    />
                                    <CommentThread
                                        target={{ type: 'post', postId: post.id }}
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
