import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';
import * as repo from '@/lib/circles/data/repo';

// GET /api/circles/meetups/:id/photos — list a meetup's photo references.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: meetupId } = await params;
  const photos = await repo.listPhotos(meetupId);
  return NextResponse.json({ photos });
}

// POST /api/circles/meetups/:id/photos — attach a photo reference (a URL).
// Body: { user_id, url, caption? }   (user_id must be an active member)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: meetupId } = await params;
  const { user_id, url, caption } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  try {
    const photo = await service.addPhoto(meetupId, user_id, url, caption);
    return NextResponse.json({ photo }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add photo' },
      { status: 400 },
    );
  }
}
