import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as repo from '@/lib/circles/data/repo';
import type { Cadence, GroupKind } from '@/lib/circles/core';

// POST /api/circles/groups — create a group.
// Body: { name, kind, timezone, default_cadence, owner_user_id }
// owner_user_id is an OPAQUE host id; the engine trusts the verified caller.
export async function POST(request: NextRequest) {
  if (!authenticate(request)) return unauthorized();

  const body = await request.json();
  const { name, kind, timezone, default_cadence, owner_user_id } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!owner_user_id) return NextResponse.json({ error: 'owner_user_id is required' }, { status: 400 });
  if (!timezone) return NextResponse.json({ error: 'timezone is required' }, { status: 400 });

  try {
    const group = await repo.createGroup({
      name,
      kind: (kind ?? 'generic') as GroupKind,
      timezone,
      defaultCadence: (default_cadence ?? { rhythm: 'adhoc' }) as Cadence,
      ownerUserId: owner_user_id,
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create group' },
      { status: 400 },
    );
  }
}
