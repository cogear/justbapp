import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MessageInput } from '@/components/messages/message-input';
import { ConversationRefresh } from '@/components/messages/conversation-refresh';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    const stackUser = await stackServerApp.getUser({ or: 'redirect' });
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });
    if (!user) notFound();

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                include: { user: { select: { id: true, displayName: true, email: true } } },
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                take: 200,
                include: { author: { select: { id: true, displayName: true } } },
            },
        },
    });

    const me = conversation?.participants.find((p) => p.user.id === user.id);
    if (!conversation || !me) notFound();

    const other = conversation.participants.find((p) => p.user.id !== user.id);

    // Mark read on view
    await prisma.conversationParticipant.update({
        where: { id: me.id },
        data: { lastReadAt: new Date() },
    });

    return (
        <main className="min-h-screen bg-background py-12 px-6">
            <ConversationRefresh />
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/messages"
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors"
                        aria-label="Back to messages"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                        {other?.user.displayName || other?.user.email || 'Member'}
                    </h1>
                </header>

                <div className="space-y-4 min-h-[40vh]">
                    {conversation.messages.length === 0 && (
                        <p className="text-center text-muted-foreground py-16">
                            Say hello — your message will reach them by email too.
                        </p>
                    )}
                    {conversation.messages.map((message) => {
                        const isMine = message.author.id === user.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        isMine
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-secondary/60 text-foreground rounded-bl-md'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <p
                                        className={`text-[10px] mt-1.5 ${
                                            isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {message.createdAt.toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                        {message.sourceChannel !== 'APP' && (
                                            <span className="ml-1.5 uppercase tracking-wide">
                                                via {message.sourceChannel.toLowerCase()}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="sticky bottom-6">
                    <MessageInput conversationId={conversation.id} />
                </div>
            </div>
        </main>
    );
}
