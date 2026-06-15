import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';
import { render } from '@react-email/render';
import { formatInTimeZone } from 'date-fns-tz';
import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';
import * as gatherings from '@/lib/gatherings/service';
import { GatheringsReminderEmail } from '@/emails/GatheringsReminderEmail';
import { sendSms, smsEnabled } from '@/lib/messaging/sms';
import { SMS_TEMPLATES } from '@/lib/messaging/sms-templates';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';
const FROM = 'b. Gatherings <gatherings@theblife.com>';
const SUBJECT: Record<gatherings.ReminderKind, (group: string) => string> = {
    pre_meetup: (g) => `See you soon — ${g}`,
    rsvp_cutoff: (g) => `RSVP closes soon — ${g}`,
    decision_close: (g) => `Help pick the spot — ${g}`,
};
// One-line SMS body (rides the Sent notification template's var_1).
const SMS_TEXT: Record<gatherings.ReminderKind, (group: string, when: string) => string> = {
    pre_meetup: (g, when) => `${g} is meeting ${when}.`,
    rsvp_cutoff: (g) => `RSVP closing soon for ${g}.`,
    decision_close: (g) => `Help pick where ${g} meets — voting closes soon.`,
};

// GET /api/cron/gatherings-reminders
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
    const generated = await gatherings.generateDueMeetups(now);
    const resolved = await gatherings.resolveDueDecisions(now);
    const settled = await gatherings.markPastMeetupsDone(now);
    const intents = await gatherings.getDueReminders(now);

    let sent = 0;
    let skipped = 0;

    for (let i = 0; i < intents.length; i++) {
        const intent = intents[i];

        // Host concern: resolve the opaque id to a real person. Synthetic/test ids
        // (and anyone without an active email) simply have nothing to deliver to.
        const user = await prisma.user.findUnique({
            where: { id: intent.userId },
            include: { notificationPreference: true },
        });
        if (!user) {
            skipped++;
            continue;
        }

        const startsAtFormatted = formatInTimeZone(
            intent.startsAt,
            intent.timezone,
            "EEEE, MMM d 'at' h:mm a zzz",
        );
        const ctaUrl = `${SITE_URL}/gatherings`;
        let emailOk = false;
        let smsOk = false;

        // ── Email (branded) ──
        if (user.email && user.emailActive !== false) {
            try {
                const html = await render(
                    React.createElement(GatheringsReminderEmail, {
                        kind: intent.kind,
                        groupName: intent.groupName,
                        startsAtFormatted,
                        ctaUrl,
                    }),
                );
                const response = await resend.emails.send({
                    from: FROM,
                    to: user.email,
                    subject: SUBJECT[intent.kind](intent.groupName),
                    html,
                });
                if (response.error) {
                    console.error(`[gatherings-reminders] email failed for ${user.email}:`, response.error);
                } else {
                    emailOk = true;
                }
            } catch (e) {
                console.error('[gatherings-reminders] email error:', e);
            }
        }

        // ── SMS (opt-in: verified phone + consent + event-SMS pref) ──
        const wantsSms = user.notificationPreference?.eventSms ?? false;
        if (
            wantsSms &&
            smsEnabled() &&
            user.smsActive &&
            user.phone &&
            user.phoneVerifiedAt &&
            user.smsConsentAt
        ) {
            try {
                const shortWhen = formatInTimeZone(intent.startsAt, intent.timezone, 'EEE MMM d, h:mm a');
                const text = SMS_TEXT[intent.kind](intent.groupName, shortWhen);
                const result = await sendSms(user.phone, {
                    template: SMS_TEMPLATES.notification,
                    variables: { var_1: text, var_2: ctaUrl },
                });
                if ('id' in result) smsOk = true;
                else console.error(`[gatherings-reminders] sms failed for ${intent.userId}:`, result.error);
            } catch (e) {
                console.error('[gatherings-reminders] sms error:', e);
            }
        }

        if (emailOk || smsOk) {
            await gatherings.markReminderSent(intent.meetupId, intent.userId, intent.kind);
            sent++;
        } else {
            // Nothing delivered (no active channel, or all sends failed) — leave
            // unmarked so a later tick can retry if a channel comes back.
            skipped++;
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
    });
}
