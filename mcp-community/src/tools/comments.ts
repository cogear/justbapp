import prisma from '../prisma.js';

export async function createComment(args: { content: string; post_id: string; author_email: string }) {
    const post = await prisma.post.findUnique({ where: { id: args.post_id } });
    if (!post) {
        return { success: false, message: `Post with id "${args.post_id}" not found` };
    }

    const user = await prisma.user.findUnique({ where: { email: args.author_email } });
    if (!user) {
        return { success: false, message: `User with email "${args.author_email}" not found` };
    }

    const comment = await prisma.comment.create({
        data: {
            content: args.content,
            postId: args.post_id,
            authorId: user.id,
        },
        include: { author: true }
    });

    return {
        success: true,
        comment: {
            id: comment.id,
            content: comment.content,
            author: comment.author.displayName || comment.author.email,
            postId: comment.postId,
            createdAt: comment.createdAt,
        }
    };
}
