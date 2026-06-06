import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/gatherings/service';

// POST /api/gatherings/groups/:id/invite — invite a user to the group.
// Body: { acting_user_id, user_id }   (both opaque host ids; acting must be an organizer)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: groupId } = await params;
  const { acting_user_id, user_id } = await request.json();
  if (!acting_user_id) return NextResponse.json({ error: 'acting_user_id is required' }, { status: 400 });
  if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

  try {
    const member = await service.inviteMember(groupId, acting_user_id, user_id);
    return NextResponse.json({ member }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to invite member' },
      { status: 400 },
    );
  }
}
