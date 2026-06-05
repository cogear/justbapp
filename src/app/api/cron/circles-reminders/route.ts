import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';
import { render } from '@react-email/render';
import { formatInTimeZone } from 'date-fns-tz';
import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';
import * as circles from '@/lib/circles/service';
import { CirclesReminderEmail } from '@/emails/CirclesReminderEmail';

export const dynamic = 'force-dynamic';

const FROM = 'b. Circles <circles@theblife.com>';
const SUBJECT: Record<circles.ReminderKind, (group: string) => string> = {
    pre_meetup: (g) => `See you soon — ${g}`,
    rsvp_cutoff: (g) => `RSVP closes soon — ${g}`,
    decision_close: (g) => `Help pick the spot — ${g}`,
};

// GET /api/cron/circles-reminders
// Tops up cadence meetups, then delivers due reminders. The ENGINE decides who to
// remind (opaque ids); this HOST route resolves id → email and sends via Resend.
export async function GET(request: NextRequest) {
    // Guard: when CRON_SECRET is set, require it (this endpoint sends real email).
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const auth = request.headers.get('authorization');
        if (auth !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const now = new Date();
    const generated = await circles.generateDueMeetups(now);
    const resolved = await circles.resolveDueDecisions(now);
    const settled = await circles.markPastMeetupsDone(now);
    const intents = await circles.getDueReminders(now);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < intents.length; i++) {
        const intent = intents[i];

        // Host concern: resolve the opaque id to a real person. Synthetic/test ids
        // (and anyone without an active email) simply have nothing to deliver to.
        const user = await prisma.user.findUnique({ where: { id: intent.userId } });
        if (!user?.email || user.emailActive === false) {
            skipped++;
            continue;
        }

        try {
            const startsAtFormatted = formatInTimeZone(
                intent.startsAt,
                intent.timezone,
                "EEEE, MMM d 'at' h:mm a zzz",
            );
            const html = await render(
                React.createElement(CirclesReminderEmail, {
                    kind: intent.kind,
                    groupName: intent.groupName,
                    startsAtFormatted,
                }),
            );

            const response = await resend.emails.send({
                from: FROM,
                to: user.email,
                subject: SUBJECT[intent.kind](intent.groupName),
                html,
            });

            if (response.error) {
                console.error(`[circles-reminders] send failed for ${user.email}:`, response.error);
                failed++;
            } else {
                await circles.markReminderSent(intent.meetupId, intent.userId, intent.kind);
                sent++;
            }
        } catch (e) {
            console.error('[circles-reminders] delivery error:', e);
            failed++;
        }

        // Resend rate limit: ~2/sec. Match the newsletter's 600ms spacing.
        if (i < intents.length - 1) {
            await new Promise((r) => setTimeout(r, 600));
        }
    }

    return NextResponse.json({
        ok: true,
        groupsGenerated: generated.length,
        decisionsResolved: resolved.length,
        meetupsSettled: settled,
        due: intents.length,
        sent,
        skipped,
        failed,
    });
}
