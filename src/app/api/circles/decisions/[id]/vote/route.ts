import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';

// POST /api/circles/decisions/:id/vote — cast or change a vote.
// Body: { user_id, option_id }   (opaque host id)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: decisionId } = await params;
  const { user_id, option_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  if (!option_id) return NextResponse.json({ error: 'option_id is required' }, { status: 400 });

  try {
    const vote = await service.castVote(decisionId, user_id, option_id);
    return NextResponse.json({ vote });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to cast vote' },
      { status: 400 },
    );
  }
}
