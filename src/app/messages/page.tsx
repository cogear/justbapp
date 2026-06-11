import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
    const stackUser = await stackServerApp.getUser({ or: 'redirect' });
    const user = await prisma.user.findUnique({
        where: { email: stackUser.primaryEmail || '' },
    });

    const conversations = user
        ? await prisma.conversation.findMany({
              where: { participants: { some: { userId: user.id } } },
              orderBy: { lastMessageAt: 'desc' },
              include: {
                  participants: {
                      include: {
                          user: { select: { id: true, displayName: true, email: true } },
                      },
                  },
                  messages: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                      select: { content: true, authorId: true, createdAt: true },
                  },
              },
          })
        : [];

    return (
        <main className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-foreground">Messages</h1>
                    <p className="text-muted-foreground">
                        Quiet conversations with members of the community.
                    </p>
                </header>

                {conversations.length === 0 ? (
                    <div className="text-center py-16 space-y-4 bg-secondary/30 rounded-3xl border border-border/40">
                        <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                            No conversations yet. Reach out to a member from the community to begin.
                        </p>
                        <Link
                            href="/community"
                            className="inline-block px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                        >
                            Visit the community
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {conversations.map((conversation) => {
                            const me = conversation.participants.find((p) => p.user.id === user?.id);
                            const other = conversation.participants.find((p) => p.user.id !== user?.id);
                            const lastMessage = conversation.messages[0];
                            const unread =
                                !!lastMessage &&
                                lastMessage.authorId !== user?.id &&
                                (!me?.lastReadAt || lastMessage.createdAt > me.lastReadAt);

                            return (
                                <li key={conversation.id}>
                                    <Link
                                        href={`/messages/${conversation.id}`}
                                        className="block bg-secondary/40 hover:bg-secondary/70 border border-border/40 rounded-2xl p-5 transition-all hover:scale-[1.005]"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-foreground">
                                                {other?.user.displayName || other?.user.email || 'Member'}
                                            </span>
                                            <span className="flex items-center gap-2 shrink-0">
                                                {unread && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary" aria-label="Unread" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {conversation.lastMessageAt.toLocaleDateString()}
                                                </span>
                                            </span>
                                        </div>
                                        {lastMessage && (
                                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                                                {lastMessage.authorId === user?.id ? 'You: ' : ''}
                                                {lastMessage.content}
                                            </p>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
