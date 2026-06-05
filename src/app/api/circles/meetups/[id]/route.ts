import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as repo from '@/lib/circles/data/repo';

// GET /api/circles/meetups/:id — meetup with RSVPs and computed headcount.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: meetupId } = await params;
  const view = await repo.getMeetupView(meetupId);
  if (!view) return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });

  return NextResponse.json(view);
}
