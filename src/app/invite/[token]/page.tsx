import prisma from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users } from 'lucide-react';
import { AcceptInviteButton } from '@/components/messages/accept-invite-button';

export const dynamic = 'force-dynamic';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: {
            space: { select: { name: true, slug: true, description: true } },
            inviter: { select: { displayName: true } },
        },
    });
    if (!invitation) notFound();

    const stackUser = await stackServerApp.getUser();
    const inviterName = invitation.inviter.displayName || 'A member';

    const expired =
        invitation.status === 'EXPIRED' ||
        (invitation.status === 'PENDING' && invitation.expiresAt < new Date());
    const invalid = invitation.status === 'REVOKED' || invitation.status === 'DECLINED';
    const accepted = invitation.status === 'ACCEPTED';

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
                            Ask {inviterName} to send a fresh one, or explore the community on your own.
                        </p>
                        <Link
                            href="/community"
                            className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                        >
                            Visit the community
                        </Link>
                    </>
                ) : accepted ? (
                    <>
                        <h1 className="text-2xl font-serif font-bold text-foreground">
                            Invitation already accepted
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            This invitation has been used. If that was you, the space is waiting.
                        </p>
                        <Link
                            href={`/community/${invitation.space.slug}`}
                            className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                        >
                            Go to {invitation.space.name}
                        </Link>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-serif font-bold text-foreground">
                            {inviterName} invited you to join
                            <br />
                            <span className="text-primary">{invitation.space.name}</span>
                        </h1>
                        {invitation.personalNote && (
                            <p className="text-foreground italic bg-background/60 border border-border/40 rounded-2xl p-4">
                                &ldquo;{invitation.personalNote}&rdquo;
                            </p>
                        )}
                        {invitation.space.description && (
                            <p className="text-muted-foreground leading-relaxed">
                                {invitation.space.description}
                            </p>
                        )}
                        {stackUser ? (
                            <AcceptInviteButton token={token} />
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href={`/sign-in?after_auth_return_to=/invite/${token}`}
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
