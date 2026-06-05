// Integration test for Phase 2 decide-step. Runs against the current DB with
// synthetic opaque ids; cleans up everything scoped to the groups it creates
// (votes, decisions, reminders, rsvps, meetups, members, group).

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '@/lib/prisma';
import * as repo from './data/repo';
import * as service from './service';

async function cleanupGroup(groupId: string) {
  const meetups = await prisma.circlesMeetup.findMany({ where: { groupId }, select: { id: true } });
  const meetupIds = meetups.map((m) => m.id);
  if (meetupIds.length) {
    const decisions = await prisma.circlesDecision.findMany({
      where: { meetupId: { in: meetupIds } },
      select: { id: true },
    });
    const decisionIds = decisions.map((d) => d.id);
    if (decisionIds.length) {
      await prisma.circlesVote.deleteMany({ where: { decisionId: { in: decisionIds } } });
      await prisma.circlesDecision.deleteMany({ where: { id: { in: decisionIds } } });
    }
    await prisma.circlesReminder.deleteMany({ where: { meetupId: { in: meetupIds } } });
    await prisma.circlesRsvp.deleteMany({ where: { meetupId: { in: meetupIds } } });
  }
  await prisma.circlesMeetup.deleteMany({ where: { groupId } });
  await prisma.circlesMember.deleteMany({ where: { groupId } });
  await prisma.circlesGroup.delete({ where: { id: groupId } });
}

describe('circles decide-step (integration)', () => {
  const owner = 'test-user-owner-p2';
  const guest = 'test-user-guest-p2';
  const groupIds: string[] = [];

  beforeAll(() => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');
  });

  afterAll(async () => {
    for (const id of groupIds) await cleanupGroup(id);
    await prisma.$disconnect();
  });

  it('venue_vote: open → vote (one per user) → resolve writes the venue', async () => {
    const group = await repo.createGroup({
      name: 'P2 Dinner Club',
      kind: 'dinner',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'monthly', nth: 1, weekday: 'fri', time: '19:00' },
    });
    groupIds.push(group.id);
    await prisma.circlesMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });

    const startsAt = new Date(Date.now() + 5 * 86400_000);
    const meetup = await repo.createMeetup(group.id, startsAt);

    // Open with a past closesAt so it's immediately due for resolution (votes are
    // still accepted while status is 'open').
    const options = [
      { id: 'a', label: 'Trattoria' },
      { id: 'b', label: 'Sushi Bar' },
    ];
    const decision = await service.openDecision(meetup.id, owner, options, {
      closesAt: new Date(Date.now() - 3600_000),
    });
    expect(decision.type).toBe('venue_vote');

    const afterOpen = await repo.getMeetupView(meetup.id);
    expect(afterOpen!.meetup.status).toBe('deciding');

    // owner votes a, guest votes b, then guest changes to a → a should win 2–0.
    await service.castVote(decision.id, owner, 'a');
    await service.castVote(decision.id, guest, 'b');
    await service.castVote(decision.id, guest, 'a'); // re-vote (no duplicate row)

    const view = await service.getDecision(decision.id);
    expect(view!.votes).toHaveLength(2); // one row per user
    expect(view!.tally.find((t) => t.optionId === 'a')!.count).toBe(2);

    const resolutions = await service.resolveDueDecisions(new Date());
    expect(resolutions.some((r) => r.decisionId === decision.id)).toBe(true);

    const final = await repo.getMeetupView(meetup.id);
    expect(final!.meetup.status).toBe('confirmed');
    expect(final!.meetup.locationText).toBe('Trattoria');
    expect(final!.decision!.decision.status).toBe('resolved');
    expect(final!.decision!.decision.resolvedOptionId).toBe('a');
  });

  it('host_pick: resolution writes "Hosted by <winner>"', async () => {
    const group = await repo.createGroup({
      name: 'P2 Board Games',
      kind: 'boardgames',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'adhoc' },
    });
    groupIds.push(group.id);

    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 6 * 86400_000));
    const decision = await service.openDecision(
      meetup.id,
      owner,
      [{ id: 'h1', label: 'Dana' }, { id: 'h2', label: 'Sam' }],
      { closesAt: new Date(Date.now() - 3600_000) },
    );
    expect(decision.type).toBe('host_pick');
    await service.castVote(decision.id, owner, 'h2');

    await service.resolveDueDecisions(new Date());
    const final = await repo.getMeetupView(meetup.id);
    expect(final!.meetup.locationText).toBe('Hosted by Sam');
  });

  it('none-kind groups have no decide-step', async () => {
    const group = await repo.createGroup({
      name: 'P2 Volleyball',
      kind: 'sport',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'adhoc' },
    });
    groupIds.push(group.id);
    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 7 * 86400_000));
    await expect(
      service.openDecision(meetup.id, owner, [{ id: 'x', label: 'Anywhere' }]),
    ).rejects.toThrow();
  });

  it('decision_close: nudges active members who have not voted', async () => {
    const group = await repo.createGroup({
      name: 'P2 Coffee',
      kind: 'coffee',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'adhoc' },
    });
    groupIds.push(group.id);
    await prisma.circlesMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });

    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 2 * 86400_000));
    // Closes ~1h out → inside the nudge window.
    const decision = await service.openDecision(
      meetup.id,
      owner,
      [{ id: 'c1', label: 'Blue Bottle' }],
      { closesAt: new Date(Date.now() + 3600_000) },
    );
    // owner votes; guest does not → only guest should be nudged.
    await service.castVote(decision.id, owner, 'c1');

    const intents = (await service.getDueReminders(new Date())).filter(
      (i) => i.meetupId === meetup.id && i.kind === 'decision_close',
    );
    expect(intents.map((i) => i.userId)).toEqual([guest]);
  });
});
