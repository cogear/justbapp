// Integration test for the Phase 0 vertical slice. Runs against the current
// database (per plan): it touches ONLY circles_* rows, uses synthetic opaque
// userIds (so it never creates a real User), and cleans up by deleting the rows
// scoped to the group it created — never a blanket truncate/deleteMany({}).

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '@/lib/prisma';
import * as repo from './repo';

describe('circles vertical slice (integration)', () => {
  const owner = 'test-user-owner';
  const guest = 'test-user-guest';
  let groupId: string | undefined;

  beforeAll(async () => {
    // Fail loudly rather than silently skipping if the DB isn't configured.
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');
  });

  afterAll(async () => {
    if (groupId) {
      const meetups = await prisma.circlesMeetup.findMany({ where: { groupId }, select: { id: true } });
      const meetupIds = meetups.map((m) => m.id);
      if (meetupIds.length) {
        await prisma.circlesRsvp.deleteMany({ where: { meetupId: { in: meetupIds } } });
      }
      await prisma.circlesMeetup.deleteMany({ where: { groupId } });
      await prisma.circlesMember.deleteMany({ where: { groupId } });
      await prisma.circlesGroup.delete({ where: { id: groupId } });
    }
    await prisma.$disconnect();
  });

  it('create group → invite → meetup → rsvp yes → headcount = 1', async () => {
    // create group (owner is seated as an active member by repo)
    const group = await repo.createGroup({
      name: 'Test Thursday Volleyball',
      kind: 'sport',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'weekly', days: ['thu'], time: '18:30' },
    });
    groupId = group.id;
    expect(group.id).toBeTruthy();

    // invite a guest
    const member = await repo.inviteMember(group.id, guest);
    expect(member.status).toBe('invited');

    // create one meetup
    const startsAt = new Date('2026-07-02T22:30:00.000Z');
    const meetup = await repo.createMeetup(group.id, startsAt);
    expect(meetup.groupId).toBe(group.id);

    // guest RSVPs yes
    const rsvp = await repo.setRsvp(meetup.id, guest, 'yes');
    expect(rsvp.state).toBe('yes');

    // read headcount
    const view = await repo.getMeetupView(meetup.id);
    expect(view).not.toBeNull();
    expect(view!.headcount).toEqual({ yes: 1, no: 0, maybe: 0 });
  });

  it('meetup generation is idempotent on (group, startsAt)', async () => {
    if (!groupId) throw new Error('group not created');
    const startsAt = new Date('2026-07-09T22:30:00.000Z');
    const a = await repo.createMeetup(groupId, startsAt);
    const b = await repo.createMeetup(groupId, startsAt);
    expect(b.id).toBe(a.id); // same row, not a duplicate
  });
});
