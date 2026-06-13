import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import * as service from '@/lib/gatherings/service';
import * as repo from '@/lib/gatherings/data/repo';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theblife.com';
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

/** YYYYMMDDTHHMMSSZ (UTC basic format). */
function ics(dt: Date): string {
    return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/** Escape a text value per RFC 5545. */
function esc(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// GET /api/gatherings/groups/[id]/ics — an .ics of this gathering's upcoming dates.
// Session-gated by active membership. (A live subscription feed would need a token.)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getOrCreateUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    try {
        await service.assertMember(id, user.id);
    } catch {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const group = await repo.getGroup(id);
    if (!group) return new NextResponse('Not found', { status: 404 });

    const now = new Date();
    const meetups = await repo.listGroupMeetups(id, { after: now, order: 'asc', limit: 100 });

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//The B Life//Gatherings//EN',
        'CALSCALE:GREGORIAN',
        `X-WR-CALNAME:${esc(group.name)}`,
    ];
    for (const m of meetups) {
        if (m.status === 'cancelled') continue;
        const end = new Date(m.startsAt.getTime() + DEFAULT_DURATION_MS);
        lines.push(
            'BEGIN:VEVENT',
            `UID:${m.id}@theblife.com`,
            `DTSTAMP:${ics(now)}`,
            `DTSTART:${ics(m.startsAt)}`,
            `DTEND:${ics(end)}`,
            `SUMMARY:${esc(group.name)}`,
            ...(m.locationText ? [`LOCATION:${esc(m.locationText)}`] : []),
            `DESCRIPTION:${esc(`Your ${group.kind} gathering. RSVP & details: ${SITE_URL}/gatherings`)}`,
            `URL:${SITE_URL}/gatherings`,
            'END:VEVENT',
        );
    }
    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
        status: 200,
        headers: {
            'content-type': 'text/calendar; charset=utf-8',
            'content-disposition': `attachment; filename="${group.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics"`,
        },
    });
}
