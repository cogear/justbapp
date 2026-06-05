'use server';

// Circles — in-app server actions. The host UI calls these; they resolve the
// signed-in user to an opaque User.id and delegate to the circles data module.
// They never reach into circles/core internals beyond the shared types.

import { getOrCreateUser } from '@/lib/auth';
import * as repo from '@/lib/circles/data/repo';
import * as service from '@/lib/circles/service';
import type { Cadence, DecisionOption, GroupKind, RsvpState } from '@/lib/circles/core';

export async function createGroupAction(input: {
  name: string;
  kind: GroupKind;
  timezone: string;
  defaultCadence: Cadence;
}) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };

  if (!input.name?.trim()) return { error: 'Group name is required' };

  try {
    const group = await repo.createGroup({ ...input, ownerUserId: user.id });
    return { success: true, group };
  } catch (e) {
    console.error('Failed to create circle:', e);
    return { error: e instanceof Error ? e.message : 'Failed to create circle' };
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
