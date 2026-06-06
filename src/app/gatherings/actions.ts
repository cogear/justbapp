'use server';

// Gatherings — in-app server actions. The host UI calls these; they resolve the
// signed-in user to an opaque User.id and delegate to the gatherings data module.
// They never reach into gatherings/core internals beyond the shared types.

import { getOrCreateUser } from '@/lib/auth';
import * as repo from '@/lib/gatherings/data/repo';
import * as service from '@/lib/gatherings/service';
import type { Cadence, DecisionOption, GroupKind, RsvpState, ScheduleType } from '@/lib/gatherings/core';

export async function createGroupAction(input: {
  name: string;
  kind: GroupKind;
  timezone: string;
  scheduleType?: ScheduleType;
  defaultCadence: Cadence;
}) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  if (!input.name?.trim()) return { error: 'Please name your gathering' };

  try {
    const group = await repo.createGroup({ ...input, ownerUserId: user.id });
    return { success: true, group };
  } catch (e) {
    console.error('Failed to create gathering:', e);
    return { error: e instanceof Error ? e.message : 'Failed to create gathering' };
  }
}

export async function deleteMeetupAction(meetupId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    await service.deleteMeetup(meetupId, user.id);
    return { success: true };
  } catch (e) {
    console.error('Failed to delete occurrence:', e);
    return { error: e instanceof Error ? e.message : 'Failed to delete' };
  }
}

export async function setLocationAction(
  meetupId: string,
  locationText: string,
  placeId?: string | null,
) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const meetup = await service.setLocation(meetupId, user.id, locationText, placeId);
    return { success: true, meetup };
  } catch (e) {
    console.error('Failed to set location:', e);
    return { error: e instanceof Error ? e.message : 'Failed to set location' };
  }
}

export async function generateUpcomingAction(groupId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    await service.assertOrganizer(groupId, user.id);
    const { created } = await service.generateForGroup(groupId);
    return { success: true, created };
  } catch (e) {
    console.error('Failed to generate upcoming:', e);
    return { error: e instanceof Error ? e.message : 'Failed to generate upcoming' };
  }
}

export async function inviteAction(groupId: string, userId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const member = await service.inviteMember(groupId, user.id, userId);
    return { success: true, member };
  } catch (e) {
    console.error('Failed to invite member:', e);
    return { error: e instanceof Error ? e.message : 'Failed to invite member' };
  }
}

export async function createMeetupAction(groupId: string, startsAt: Date) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const meetup = await service.createMeetupManual(groupId, user.id, startsAt);
    return { success: true, meetup };
  } catch (e) {
    console.error('Failed to create meetup:', e);
    return { error: e instanceof Error ? e.message : 'Failed to create meetup' };
  }
}

export async function rsvpAction(meetupId: string, state: RsvpState) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    await repo.setRsvp(meetupId, user.id, state);
    return { success: true };
  } catch (e) {
    console.error('Failed to RSVP:', e);
    return { error: 'Failed to RSVP' };
  }
}

export async function getMeetupAction(meetupId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  const view = await repo.getMeetupView(meetupId);
  if (!view) return { error: 'Meetup not found' };
  return { success: true, ...view };
}

export async function proposeOptionsAction(meetupId: string, options: DecisionOption[]) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const decision = await service.openDecision(meetupId, user.id, options);
    return { success: true, decision };
  } catch (e) {
    console.error('Failed to open decision:', e);
    return { error: e instanceof Error ? e.message : 'Failed to open decision' };
  }
}

export async function voteAction(decisionId: string, optionId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    await service.castVote(decisionId, user.id, optionId);
    return { success: true };
  } catch (e) {
    console.error('Failed to cast vote:', e);
    return { error: e instanceof Error ? e.message : 'Failed to cast vote' };
  }
}

export async function getDecisionAction(decisionId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  const view = await service.getDecision(decisionId);
  if (!view) return { error: 'Decision not found' };
  return { success: true, ...view };
}

export async function promoteCoOrganizerAction(groupId: string, targetUserId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const member = await service.setMemberRole(groupId, user.id, targetUserId, 'co_organizer');
    return { success: true, member };
  } catch (e) {
    console.error('Failed to promote member:', e);
    return { error: e instanceof Error ? e.message : 'Failed to promote member' };
  }
}

export async function demoteCoOrganizerAction(groupId: string, targetUserId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const member = await service.setMemberRole(groupId, user.id, targetUserId, 'member');
    return { success: true, member };
  } catch (e) {
    console.error('Failed to demote member:', e);
    return { error: e instanceof Error ? e.message : 'Failed to demote member' };
  }
}

export async function addPhotoAction(meetupId: string, url: string, caption?: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  try {
    const photo = await service.addPhoto(meetupId, user.id, url, caption);
    return { success: true, photo };
  } catch (e) {
    console.error('Failed to add photo:', e);
    return { error: e instanceof Error ? e.message : 'Failed to add photo' };
  }
}

export async function getTimelineAction(groupId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  const timeline = await service.getTimeline(groupId);
  return { success: true, ...timeline };
}

export async function getMyGatheringsAction() {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' as const };

  const groups = await service.listGroupsForUser(user.id);
  return { success: true as const, groups };
}

/** Composed detail for the demo UI: the group, the viewer's role, and upcoming meetups. */
export async function getGroupDetailAction(groupId: string) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' as const };

  const group = await repo.getGroup(groupId);
  if (!group) return { error: 'Gathering not found' as const };

  const member = await repo.getMember(groupId, user.id);
  const since = new Date(Date.now() - 86_400_000); // include things starting today
  const meetupRows = await repo.listGroupMeetups(groupId, { after: since, order: 'asc', limit: 10 });

  const meetups = [];
  for (const m of meetupRows) {
    const view = await repo.getMeetupView(m.id);
    if (!view) continue;
    meetups.push({
      meetup: view.meetup,
      headcount: view.headcount,
      decision: view.decision,
      myRsvp: view.rsvps.find((r) => r.userId === user.id)?.state ?? ('none' as const),
    });
  }

  return { success: true as const, group, role: member?.role ?? null, meetups };
}
