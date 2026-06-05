import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';

// POST /api/circles/groups/:id/members/:userId/role — promote/demote a member.
// Body: { acting_user_id, role: "member" | "co_organizer" }   (acting must be an organizer)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  if (!authenticate(request)) return unauthorized();

  const { id: groupId, userId: targetUserId } = await params;
  const { acting_user_id, role } = await request.json();
  if (!acting_user_id) return NextResponse.json({ error: 'acting_user_id is required' }, { status: 400 });
  if (role !== 'member' && role !== 'co_organizer') {
    return NextResponse.json({ error: 'role must be member or co_organizer' }, { status: 400 });
  }

  try {
    const member = await service.setMemberRole(groupId, acting_user_id, targetUserId, role);
    return NextResponse.json({ member });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to set role' },
      { status: 400 },
    );
  }
}
