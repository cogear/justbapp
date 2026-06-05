// Integration test for Phase 1 generation + reminder intents. Runs against the
// current DB with synthetic opaque ids; cleans up everything scoped to its own
// group (including circles_reminders). Reminder assertions filter to the test's
// own meetup id so unrelated data in the window can't affect them.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '@/lib/prisma';
import * as repo from './data/repo';
import * as service from './service';

describe('circles generation + reminders (integration)', () => {
  const owner = 'test-user-owner-p1';
  const guest = 'test-user-guest-p1';
  let groupId: string | undefined;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');
  });

  afterAll(async () => {
    if (groupId) {
      const meetups = await prisma.circlesMeetup.findMany({ where: { groupId }, select: { id: true } });
      const meetupIds = meetups.map((m) => m.id);
      if (meetupIds.length) {
        await prisma.circlesReminder.deleteMany({ where: { meetupId: { in: meetupIds } } });
        await prisma.circlesRsvp.deleteMany({ where: { meetupId: { in: meetupIds } } });
      }
      await prisma.circlesMeetup.deleteMany({ where: { groupId } });
      await prisma.circlesMember.deleteMany({ where: { groupId } });
      await prisma.circlesGroup.delete({ where: { id: groupId } });
    }
    await prisma.$disconnect();
  });

  it('generateDueMeetups materializes cadence meetups and is idempotent', async () => {
    const group = await repo.createGroup({
      name: 'P1 Weekly Group',
      kind: 'sport',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'weekly', days: ['mon', 'thu'], time: '18:30' },
    });
    groupId = group.id;

    const now = new Date();
    await service.generateDueMeetups(now);
    const firstCount = await prisma.circlesMeetup.count({ where: { groupId: group.id } });
    expect(firstCount).toBeGreaterThan(0); // ~28-day horizon of mon/thu

    await service.generateDueMeetups(now); // second run must not duplicate
    const secondCount = await prisma.circlesMeetup.count({ where: { groupId: group.id } });
    expect(secondCount).toBe(firstCount);
  });

  it('getDueReminders emits pre_meetup to yes-RSVPs and rsvp_cutoff to non-responders', async () => {
    if (!groupId) throw new Error('group not created');
    const now = new Date();

    // A controlled meetup ~2h out, cutoff ~1h out → inside both reminder windows.
    const startsAt = new Date(now.getTime() + 2 * 3600_000);
    const rsvpCutoffAt = new Date(now.getTime() + 1 * 3600_000);
    const meetup = await repo.createMeetup(groupId, startsAt, { rsvpCutoffAt });

    // owner is already an active member (seated by createGroup) and RSVPs yes.
    await repo.setRsvp(meetup.id, owner, 'yes');
    // guest is an active member who has NOT responded.
    await prisma.circlesMember.create({
      data: { groupId, userId: guest, role: 'member', status: 'active' },
    });

    const intents = (await service.getDueReminders(now)).filter((i) => i.meetupId === meetup.id);
    const byKind = (k: string) => intents.filter((i) => i.kind === k).map((i) => i.userId).sort();

    expect(byKind('pre_meetup')).toEqual([owner]);
    expect(byKind('rsvp_cutoff')).toEqual([guest]);

    // Mark both sent → they should not re-fire.
    for (const i of intents) await service.markReminderSent(i.meetupId, i.userId, i.kind);
    const second = (await service.getDueReminders(now)).filter((i) => i.meetupId === meetup.id);
    expect(second).toEqual([]);
  });
});
