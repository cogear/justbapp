import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as repo from '@/lib/circles/data/repo';
import type { RsvpState } from '@/lib/circles/core';

const VALID_STATES: RsvpState[] = ['yes', 'no', 'maybe', 'none'];

// POST /api/circles/meetups/:id/rsvp — set a user's RSVP.
// Body: { user_id, state }   (opaque host id; state in yes|no|maybe|none)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: meetupId } = await params;
  const { user_id, state } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'state must be one of yes|no|maybe|none' }, { status: 400 });
  }

  try {
    const rsvp = await repo.setRsvp(meetupId, user_id, state);
    return NextResponse.json({ rsvp });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to RSVP' },
      { status: 400 },
    );
  }
}
