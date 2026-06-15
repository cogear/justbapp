// Gatherings MCP tool implementations — plain async functions over the engine
// service. All user ids are OPAQUE host ids; these tools never resolve identity.
// Lives inside the bounded context so it travels with Gatherings on extraction.

import * as service from '@/lib/gatherings/service';
import type { Cadence, DecisionOption, GroupKind, RsvpState, ScheduleType } from '@/lib/gatherings/core';

export async function createGroup(args: {
  name: string;
  kind: GroupKind;
  timezone: string;
  owner_user_id: string;
  schedule_type?: ScheduleType;
  cadence?: Cadence;
}) {
  return service.createGroup({
    name: args.name,
    kind: args.kind,
    timezone: args.timezone,
    ownerUserId: args.owner_user_id,
    scheduleType: args.schedule_type,
    defaultCadence: args.cadence ?? { rhythm: 'adhoc' },
  });
}

export async function inviteMember(args: {
  group_id: string;
  acting_user_id: string;
  user_id: string;
}) {
  return service.inviteMember(args.group_id, args.acting_user_id, args.user_id);
}

export async function createMeetup(args: {
  group_id: string;
  acting_user_id: string;
  starts_at: string;
}) {
  return service.createMeetupManual(args.group_id, args.acting_user_id, new Date(args.starts_at));
}

export async function setRsvp(args: { meetup_id: string; user_id: string; state: RsvpState }) {
  return service.setRsvp(args.meetup_id, args.user_id, args.state);
}

export async function deleteMeetup(args: { meetup_id: string; acting_user_id: string }) {
  await service.deleteMeetup(args.meetup_id, args.acting_user_id);
  return { deleted: args.meetup_id };
}

export async function setLocation(args: {
  meetup_id: string;
  acting_user_id: string;
  location_text: string;
  place_id?: string;
}) {
  return service.setLocation(args.meetup_id, args.acting_user_id, args.location_text, args.place_id);
}

export async function openDecision(args: {
  meetup_id: string;
  acting_user_id: string;
  options: DecisionOption[];
}) {
  return service.openDecision(args.meetup_id, args.acting_user_id, args.options);
}

export async function castVote(args: { decision_id: string; user_id: string; option_id: string }) {
  return service.castVote(args.decision_id, args.user_id, args.option_id);
}

export async function promoteCoOrganizer(args: {
  group_id: string;
  acting_user_id: string;
  target_user_id: string;
}) {
  return service.setMemberRole(args.group_id, args.acting_user_id, args.target_user_id, 'co_organizer');
}

export async function getMeetup(args: { meetup_id: string }) {
  const view = await service.getMeetup(args.meetup_id);
  if (!view) throw new Error('meetup not found');
  return view;
}

export async function getDecision(args: { decision_id: string }) {
  const view = await service.getDecision(args.decision_id);
  if (!view) throw new Error('decision not found');
  return view;
}

export async function getTimeline(args: { group_id: string }) {
  return service.getTimeline(args.group_id);
}

export async function listNonResponders(args: { meetup_id: string }) {
  return { meetupId: args.meetup_id, nonResponders: await service.listNonResponders(args.meetup_id) };
}

export async function groupOverview(args: { group_id: string }) {
  return service.getGroupOverview(args.group_id);
}
