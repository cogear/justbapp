import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';

// GET /api/circles/groups/:id/timeline — recent past meetups + the next upcoming one.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id: groupId } = await params;
  const timeline = await service.getTimeline(groupId);
  return NextResponse.json(timeline);
}
