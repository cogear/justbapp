import prisma from '@/lib/prisma';
import { CreatePostForm } from './create-post-form';

export async function SpaceFeed({ spaceId }: { spaceId: string }) {
    const posts = await prisma.post.findMany({
        where: { spaceId },
        orderBy: { createdAt: 'desc' },
        include: {
            author: true
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
                                        {post.author.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        {/* Use email as name for now, fallback to User */}
                                        <div className="font-medium">{post.author.email || 'User'}</div>
                                        <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
