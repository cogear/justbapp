// Integration test for Phase 3 (timeline, co-organizers, photos). Runs against the
// current DB with synthetic opaque ids; cleans up everything scoped to its group.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '@/lib/prisma';
import * as repo from './data/repo';
import * as service from './service';

async function cleanupGroup(groupId: string) {
  const meetups = await prisma.gatheringsMeetup.findMany({ where: { groupId }, select: { id: true } });
  const meetupIds = meetups.map((m) => m.id);
  if (meetupIds.length) {
    await prisma.gatheringsPhoto.deleteMany({ where: { meetupId: { in: meetupIds } } });
    await prisma.gatheringsReminder.deleteMany({ where: { meetupId: { in: meetupIds } } });
    await prisma.gatheringsRsvp.deleteMany({ where: { meetupId: { in: meetupIds } } });
  }
  await prisma.gatheringsMeetup.deleteMany({ where: { groupId } });
  await prisma.gatheringsMember.deleteMany({ where: { groupId } });
  await prisma.gatheringsGroup.delete({ where: { id: groupId } });
}

describe('gatherings history & polish (integration)', () => {
  const owner = 'test-user-owner-p3';
  const guest = 'test-user-guest-p3';
  const plain = 'test-user-plain-p3';
  const groupIds: string[] = [];

  async function newGroup(name: string) {
    const g = await repo.createGroup({
      name,
      kind: 'sport',
      ownerUserId: owner,
      timezone: 'America/New_York',
      defaultCadence: { rhythm: 'adhoc' },
    });
    groupIds.push(g.id);
    return g;
  }

  beforeAll(() => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');
  });

  afterAll(async () => {
    for (const id of groupIds) await cleanupGroup(id);
    await prisma.$disconnect();
  });

  it('timeline: marks past meetups done and returns past + next', async () => {
    const group = await newGroup('P3 Timeline');
    const past = await repo.createMeetup(group.id, new Date(Date.now() - 3 * 86400_000));
    const future = await repo.createMeetup(group.id, new Date(Date.now() + 3 * 86400_000));

    const settled = await service.markPastMeetupsDone(new Date());
    expect(settled).toBeGreaterThanOrEqual(1);

    const timeline = await service.getTimeline(group.id);
    expect(timeline.past.map((e) => e.meetup.id)).toContain(past.id);
    expect(timeline.past.find((e) => e.meetup.id === past.id)!.meetup.status).toBe('done');
    expect(timeline.next?.meetup.id).toBe(future.id);
  });

  it('co-organizers: organizer gating and owner protection', async () => {
    const group = await newGroup('P3 Roles');
    await prisma.gatheringsMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });
    await prisma.gatheringsMember.create({
      data: { groupId: group.id, userId: plain, role: 'member', status: 'active' },
    });

    // owner is an organizer; a plain member is not.
    await expect(service.assertOrganizer(group.id, owner)).resolves.toBeUndefined();
    await expect(service.assertOrganizer(group.id, guest)).rejects.toThrow();

    // owner promotes guest → guest gains organizer rights.
    await service.setMemberRole(group.id, owner, guest, 'co_organizer');
    await expect(service.assertOrganizer(group.id, guest)).resolves.toBeUndefined();

    // a plain member cannot change roles.
    await expect(service.setMemberRole(group.id, plain, guest, 'member')).rejects.toThrow();

    // nobody can change the owner's role.
    await expect(service.setMemberRole(group.id, guest, owner, 'member')).rejects.toThrow();
  });

  it('photos: members can attach refs; non-members cannot', async () => {
    const group = await newGroup('P3 Photos');
    const meetup = await repo.createMeetup(group.id, new Date(Date.now() - 86400_000));

    const photo = await service.addPhoto(meetup.id, owner, 'https://example.com/a.jpg', 'Great night');
    expect(photo.url).toBe('https://example.com/a.jpg');

    const view = await repo.getMeetupView(meetup.id);
    expect(view!.photos.map((p) => p.id)).toContain(photo.id);

    await expect(
      service.addPhoto(meetup.id, 'stranger', 'https://example.com/b.jpg'),
    ).rejects.toThrow();
  });

  it('set location: organizer sets it, non-organizer cannot', async () => {
    const group = await newGroup('P3 Location');
    await prisma.gatheringsMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });
    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 86400_000));

    const updated = await service.setLocation(meetup.id, owner, 'Trattoria Bella — 1 Main St', 'place_abc');
    expect(updated.locationText).toBe('Trattoria Bella — 1 Main St');
    expect(updated.locationPlaceId).toBe('place_abc');

    await expect(service.setLocation(meetup.id, guest, 'Somewhere else')).rejects.toThrow();
  });

  it('delete occurrence: organizer removes it (and its children); non-organizer cannot', async () => {
    const group = await newGroup('P3 Delete');
    await prisma.gatheringsMember.create({
      data: { groupId: group.id, userId: guest, role: 'member', status: 'active' },
    });
    const meetup = await repo.createMeetup(group.id, new Date(Date.now() + 86400_000));
    await repo.setRsvp(meetup.id, owner, 'yes');
    await repo.addPhoto(meetup.id, owner, 'https://example.com/x.jpg');

    // a plain member cannot delete
    await expect(service.deleteMeetup(meetup.id, guest)).rejects.toThrow();

    // the owner can — the occurrence and its children are gone
    await service.deleteMeetup(meetup.id, owner);
    expect(await repo.getMeetupView(meetup.id)).toBeNull();
    expect(await prisma.gatheringsRsvp.count({ where: { meetupId: meetup.id } })).toBe(0);
    expect(await prisma.gatheringsPhoto.count({ where: { meetupId: meetup.id } })).toBe(0);
  });
});
