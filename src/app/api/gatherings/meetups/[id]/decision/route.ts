import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/gatherings/service';
import type { DecisionOption } from '@/lib/gatherings/core';

// POST /api/gatherings/meetups/:id/decision — open the decide-step for a meetup.
// Body: { acting_user_id, options: [{ id, label, meta? }], closes_at?: ISO string }
// Requires organizer rights. The decision type is chosen by the group's kind.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: meetupId } = await params;
  const { acting_user_id, options, closes_at } = await request.json();

  if (!acting_user_id) return NextResponse.json({ error: 'acting_user_id is required' }, { status: 400 });
  if (!Array.isArray(options) || options.length === 0) {
    return NextResponse.json({ error: 'options must be a non-empty array' }, { status: 400 });
  }

  const closesAt = closes_at ? new Date(closes_at) : undefined;
  if (closesAt && Number.isNaN(closesAt.getTime())) {
    return NextResponse.json({ error: 'closes_at must be a valid date' }, { status: 400 });
  }

  try {
    const decision = await service.openDecision(meetupId, acting_user_id, options as DecisionOption[], { closesAt });
    return NextResponse.json({ decision }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to open decision' },
      { status: 400 },
    );
  }
}
