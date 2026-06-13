import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';
import * as service from '@/lib/gatherings/service';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users } from 'lucide-react';
import { AcceptGatheringInvite } from '@/components/gatherings/accept-gathering-invite';

export const dynamic = 'force-dynamic';

export default async function GatheringInvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const info = await service.getInvite(token);
    if (!info) notFound();

    const inviter = await prisma.user
        .findUnique({ where: { id: info.invitedByUserId }, select: { displayName: true } })
        .catch(() => null);
    const inviterName = inviter?.displayName || 'A friend';

    const stackUser = await stackServerApp.getUser();

    const invalid = info.status === 'revoked';
    const expired = info.expired && info.status === 'pending';
    const accepted = info.status === 'accepted';

    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 bg-secondary/20 rounded-[2.5rem] p-8 md:p-12 border border-border/40 shadow-sm animate-in fade-in zoom-in-95 duration-700">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-2xl">
                    <Users size={28} />
                </div>

                {expired || invalid ? (
                    <>
                        <h1 className="text-2xl font-serif font-bold text-foreground">
                            This invitation is no longer active
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Ask {inviterName} to send a fresh one.
                        </p>
                        <Link
                            href="/gatherings"
                            className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                        >
                            Go to Gatherings
                        </Link>
                    </>
                ) : accepted ? (
                    <>
                        <h1 className="text-2xl font-serif font-bold text-foreground">
                            Already accepted
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            This invitation has been used. Your gathering is waiting.
                        </p>
                        <Link
                            href="/gatherings"
                            className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                        >
                            Go to {info.groupName}
                        </Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-serif font-bold text-foreground">
                            {inviterName} invited you to
                            <br />
                            <span className="text-primary">{info.groupName}</span>
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Join the group to RSVP and see when you&rsquo;re next gathering.
                        </p>
                        {stackUser ? (
                            <AcceptGatheringInvite token={token} />
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href={`/sign-in?after_auth_return_to=/gatherings/invite/${token}`}
                                    className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                                >
                                    Sign in to accept
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    New here? Signing in creates your account.
                                </p>
                            </div>
                        )}
                    </>
                )}

                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest italic pt-2">
                    breathe … you&rsquo;re here
                </p>
            </div>
        </main>
    );
}
