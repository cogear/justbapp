// Integration test for the Phase 4 agent surface (the MCP tool functions over the
// engine service). Runs against the current DB with synthetic opaque ids; cleans
// up everything scoped to its group.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '@/lib/prisma';
import * as repo from '../data/repo';
import * as tools from './tools';

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
    await prisma.circlesPhoto.deleteMany({ where: { meetupId: { in: meetupIds } } });
    await prisma.circlesReminder.deleteMany({ where: { meetupId: { in: meetupIds } } });
    await prisma.circlesRsvp.deleteMany({ where: { meetupId: { in: meetupIds } } });
  }
  await prisma.circlesMeetup.deleteMany({ where: { groupId } });
  await prisma.circlesMember.deleteMany({ where: { groupId } });
  await prisma.circlesGroup.delete({ where: { id: groupId } });
}

describe('circles agent surface (integration)', () => {
  const owner = 'test-user-owner-p4';
  const guest = 'test-user-guest-p4';
  let groupId: string | undefined;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');
  });

  afterAll(async () => {
    if (groupId) await cleanupGroup(groupId);
    await prisma.$disconnect();
  });

  it('group_overview summarizes next meetup, non-responders, and the open vote', async () => {
    const group = await tools.createGroup({
      name: 'P4 Dinner',
      kind: 'dinner',
      timezone: 'America/New_York',
      owner_user_id: owner,
      cadence: { rhythm: 'adhoc' },
    });
    groupId = group.id;

    await prisma.circlesMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });

    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 3 * 86400_000));

    // owner RSVPs yes; guest does not respond.
    await tools.setRsvp({ meetup_id: meetup.id, user_id: owner, state: 'yes' });

    const nonResp = await tools.listNonResponders({ meetup_id: meetup.id });
    expect(nonResp.nonResponders).toEqual([guest]);

    // open a venue vote and cast one vote.
    const decision = await tools.openDecision({
      meetup_id: meetup.id,
      acting_user_id: owner,
      options: [
        { id: 'a', label: 'Trattoria' },
        { id: 'b', label: 'Sushi Bar' },
      ],
    });
    await tools.castVote({ decision_id: decision.id, user_id: owner, option_id: 'a' });

    const overview = await tools.groupOverview({ group_id: group.id });
    expect(overview.group.id).toBe(group.id);
    expect(overview.next?.meetup.id).toBe(meetup.id);
    expect(overview.next?.headcount.yes).toBe(1);
    expect(overview.nonResponders).toEqual([guest]);
    expect(overview.openDecision?.decision.id).toBe(decision.id);

    const dec = await tools.getDecision({ decision_id: decision.id });
    expect(dec.tally.find((t) => t.optionId === 'a')!.count).toBe(1);
  });

  it('non-organizer cannot open a decision via the tools', async () => {
    if (!groupId) throw new Error('group not created');
    const meetup = await repo.createMeetup(groupId, new Date(Date.now() + 5 * 86400_000));
    await expect(
      tools.openDecision({
        meetup_id: meetup.id,
        acting_user_id: guest, // a plain member
        options: [{ id: 'x', label: 'Anywhere' }],
      }),
    ).rejects.toThrow();
  });
});
