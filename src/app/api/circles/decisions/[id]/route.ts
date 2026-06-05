import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as service from '@/lib/circles/service';

// GET /api/circles/decisions/:id — decision with votes and a tally.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return unauthorized();

  const { id } = await params;
  const view = await service.getDecision(id);
  if (!view) return NextResponse.json({ error: 'Decision not found' }, { status: 404 });

  return NextResponse.json(view);
}
