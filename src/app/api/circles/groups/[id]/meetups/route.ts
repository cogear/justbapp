import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';

// POST /api/circles/groups/:id/meetups — create one meetup by hand (not cadence
// expansion). Idempotent on (group, starts_at). Requires organizer rights.
// Body: { acting_user_id, starts_at: ISO string, rsvp_cutoff_at?: ISO string }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: groupId } = await params;
  const { acting_user_id, starts_at, rsvp_cutoff_at } = await request.json();
  if (!acting_user_id) return NextResponse.json({ error: 'acting_user_id is required' }, { status: 400 });
  if (!starts_at) return NextResponse.json({ error: 'starts_at is required' }, { status: 400 });

  const startsAt = new Date(starts_at);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: 'starts_at must be a valid date' }, { status: 400 });
  }
  const rsvpCutoffAt = rsvp_cutoff_at ? new Date(rsvp_cutoff_at) : null;

  try {
    const meetup = await service.createMeetupManual(groupId, acting_user_id, startsAt, { rsvpCutoffAt });
    return NextResponse.json({ meetup }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create meetup' },
      { status: 400 },
    );
  }
}
