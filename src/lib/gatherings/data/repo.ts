// Gatherings data-access — the ONLY gatherings module that touches Prisma.
// Maps Prisma rows <-> core entities and runs core rules in between.
// Host code must never import this; the dependency-lint seam enforces that.

import prisma from '@/lib/prisma';
import * as core from '@/lib/gatherings/core';
import { Prisma } from '@prisma/client';
import type {
  GatheringsGroup as GroupRow,
  GatheringsMember as MemberRow,
  GatheringsMeetup as MeetupRow,
  GatheringsRsvp as RsvpRow,
  GatheringsDecision as DecisionRow,
  GatheringsVote as VoteRow,
  GatheringsPhoto as PhotoRow,
} from '@prisma/client';

// ─── mappers ──────────────────────────────────────────────────────────────────

function toGroup(row: GroupRow): core.Group {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as core.GroupKind,
    visibility: row.visibility as core.GroupVisibility,
    ownerUserId: row.ownerUserId,
    timezone: row.timezone,
    scheduleType: row.scheduleType as core.ScheduleType,
    defaultCadence: row.defaultCadence as unknown as core.Cadence,
  };
}

function toMember(row: MemberRow): core.Member {
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    role: row.role as core.MemberRole,
    status: row.status as core.MemberStatus,
  };
}

function toMeetup(row: MeetupRow): core.Meetup {
  return {
    id: row.id,
    groupId: row.groupId,
    startsAt: row.startsAt,
    locationText: row.locationText,
    locationPlaceId: row.locationPlaceId,
    rsvpCutoffAt: row.rsvpCutoffAt,
    status: row.status as core.MeetupStatus,
  };
}

function toRsvp(row: RsvpRow): core.Rsvp {
  return {
    id: row.id,
    meetupId: row.meetupId,
    userId: row.userId,
    state: row.state as core.RsvpState,
  };
}

// ─── operations ───────────────────────────────────────────────────────────────

export interface CreateGroupInput {
  name: string;
  kind: core.GroupKind;
  ownerUserId: string;
  timezone: string;
  scheduleType?: core.ScheduleType;
  defaultCadence: core.Cadence;
}

/** Create a group and seat its owner as an active member, atomically. */
export async function createGroup(input: CreateGroupInput): Promise<core.Group> {
  if (!core.isValidTimezone(input.timezone)) {
    throw new Error(`invalid timezone: ${input.timezone}`);
  }
  const row = await prisma.$transaction(async (tx) => {
    const group = await tx.gatheringsGroup.create({
      data: {
        name: input.name,
        kind: input.kind,
        ownerUserId: input.ownerUserId,
        timezone: input.timezone,
        scheduleType: input.scheduleType ?? 'single',
        defaultCadence: input.defaultCadence as unknown as object,
      },
    });
    await tx.gatheringsMember.create({
      data: { groupId: group.id, userId: input.ownerUserId, role: 'owner', status: 'active' },
    });
    return group;
  });
  return toGroup(row);
}

/** Invite a user to a group. Idempotent on (groupId, userId). */
export async function inviteMember(groupId: string, userId: string): Promise<core.Member> {
  const row = await prisma.gatheringsMember.upsert({
    where: { groupId_userId: { groupId, userId } },
    create: { groupId, userId, role: 'member', status: 'invited' },
    update: {}, // already invited/active — leave as-is
  });
  return toMember(row);
}

/** Create one meetup. Idempotent on (groupId, startsAt) via the unique constraint. */
export async function createMeetup(
  groupId: string,
  startsAt: Date,
  opts: { rsvpCutoffAt?: Date | null } = {},
): Promise<core.Meetup> {
  const row = await prisma.gatheringsMeetup.upsert({
    where: { groupId_startsAt: { groupId, startsAt } },
    create: { groupId, startsAt, rsvpCutoffAt: opts.rsvpCutoffAt ?? null },
    update: {},
  });
  return toMeetup(row);
}

/** Delete a meetup and everything attached to it (rsvps, reminders, decision+votes, photos). */
export async function deleteMeetup(meetupId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const decision = await tx.gatheringsDecision.findUnique({ where: { meetupId } });
    if (decision) {
      await tx.gatheringsVote.deleteMany({ where: { decisionId: decision.id } });
      await tx.gatheringsDecision.delete({ where: { id: decision.id } });
    }
    await tx.gatheringsPhoto.deleteMany({ where: { meetupId } });
    await tx.gatheringsReminder.deleteMany({ where: { meetupId } });
    await tx.gatheringsRsvp.deleteMany({ where: { meetupId } });
    await tx.gatheringsMeetup.delete({ where: { id: meetupId } });
  });
}

/** Set a meetup's location (free text or a picked Google Place). */
export async function setMeetupLocation(
  meetupId: string,
  locationText: string,
  placeId?: string | null,
): Promise<core.Meetup> {
  const row = await prisma.gatheringsMeetup.update({
    where: { id: meetupId },
    data: { locationText, locationPlaceId: placeId ?? null },
  });
  return toMeetup(row);
}

/** Set (or change) a user's RSVP for a meetup. One row per (meetupId, userId). */
export async function setRsvp(
  meetupId: string,
  userId: string,
  state: core.RsvpState,
): Promise<core.Rsvp> {
  const row = await prisma.gatheringsRsvp.upsert({
    where: { meetupId_userId: { meetupId, userId } },
    create: { meetupId, userId, state },
    update: { state },
  });
  return toRsvp(row);
}

function toPhoto(row: PhotoRow): core.Photo {
  return {
    id: row.id,
    meetupId: row.meetupId,
    addedByUserId: row.addedByUserId,
    url: row.url,
    caption: row.caption,
    createdAt: row.createdAt,
  };
}

export interface MeetupView {
  meetup: core.Meetup;
  rsvps: core.Rsvp[];
  headcount: core.Headcount;
  decision: DecisionView | null;
  photos: core.Photo[];
}

/** Read a meetup with its RSVPs, headcount, decision state, and photos. */
export async function getMeetupView(meetupId: string): Promise<MeetupView | null> {
  const row = await prisma.gatheringsMeetup.findUnique({
    where: { id: meetupId },
    include: { rsvps: true, decision: { include: { votes: true } }, photos: true },
  });
  if (!row) return null;
  const rsvps = row.rsvps.map(toRsvp);
  return {
    meetup: toMeetup(row),
    rsvps,
    headcount: core.headcount(rsvps),
    decision: row.decision ? toDecisionView(row.decision, row.decision.votes) : null,
    photos: row.photos.map(toPhoto),
  };
}

/** A meetup together with its owning group (e.g. to choose the decide-step by kind). */
export async function getMeetupWithGroup(
  meetupId: string,
): Promise<{ meetup: core.Meetup; group: core.Group } | null> {
  const row = await prisma.gatheringsMeetup.findUnique({
    where: { id: meetupId },
    include: { group: true },
  });
  if (!row) return null;
  return { meetup: toMeetup(row), group: toGroup(row.group) };
}

// ─── Phase 1: generation & reminders ───────────────────────────────────────────

/** Groups whose cadence auto-generates meetups (anything but adhoc). */
export async function listGroupsForGeneration(): Promise<core.Group[]> {
  const rows = await prisma.gatheringsGroup.findMany();
  return rows.map(toGroup).filter((g) => g.defaultCadence.rhythm !== 'adhoc');
}

export interface PreMeetupCandidate {
  meetup: core.Meetup;
  groupName: string;
  timezone: string;
  yesUserIds: string[];
  alreadyRemindedUserIds: string[];
}

/** Upcoming meetups whose attendees (RSVP'd yes) may be due a pre-meetup reminder. */
export async function findPreMeetupCandidates(
  now: Date,
  leadHours: number,
): Promise<PreMeetupCandidate[]> {
  const to = new Date(now.getTime() + leadHours * 3600_000);
  const rows = await prisma.gatheringsMeetup.findMany({
    where: { status: { in: ['scheduled', 'confirmed'] }, startsAt: { gte: now, lte: to } },
    include: { group: true, rsvps: true, reminders: { where: { kind: 'pre_meetup' } } },
  });
  return rows.map((r) => ({
    meetup: toMeetup(r),
    groupName: r.group.name,
    timezone: r.group.timezone,
    yesUserIds: r.rsvps.filter((x) => x.state === 'yes').map((x) => x.userId),
    alreadyRemindedUserIds: r.reminders.map((x) => x.userId),
  }));
}

export interface CutoffCandidate {
  meetup: core.Meetup;
  groupName: string;
  timezone: string;
  activeMemberUserIds: string[];
  respondedUserIds: string[];
  alreadyRemindedUserIds: string[];
}

/** Meetups whose RSVP cutoff is approaching, with the data to find non-responders. */
export async function findCutoffCandidates(
  now: Date,
  leadHours: number,
): Promise<CutoffCandidate[]> {
  const to = new Date(now.getTime() + leadHours * 3600_000);
  const rows = await prisma.gatheringsMeetup.findMany({
    where: { status: { in: ['scheduled', 'deciding'] }, rsvpCutoffAt: { gte: now, lte: to } },
    include: {
      group: { include: { members: true } },
      rsvps: true,
      reminders: { where: { kind: 'rsvp_cutoff' } },
    },
  });
  return rows.map((r) => ({
    meetup: toMeetup(r),
    groupName: r.group.name,
    timezone: r.group.timezone,
    activeMemberUserIds: r.group.members.filter((m) => m.status === 'active').map((m) => m.userId),
    respondedUserIds: r.rsvps.filter((x) => x.state !== 'none').map((x) => x.userId),
    alreadyRemindedUserIds: r.reminders.map((x) => x.userId),
  }));
}

/** Record that a reminder was sent. Idempotent on (meetup, user, kind). */
export async function recordReminderSent(
  meetupId: string,
  userId: string,
  kind: string,
): Promise<void> {
  try {
    await prisma.gatheringsReminder.create({ data: { meetupId, userId, kind } });
  } catch (e) {
    // P2002 = unique violation → already recorded; treat as a no-op.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
  }
}

// ─── Phase 2: decide-step (decisions & votes) ───────────────────────────────────

function toDecision(row: DecisionRow): core.Decision {
  return {
    id: row.id,
    meetupId: row.meetupId,
    type: row.type as core.DecisionType,
    options: row.options as unknown as core.DecisionOption[],
    status: row.status as core.DecisionStatus,
    closesAt: row.closesAt,
    resolvedOptionId: row.resolvedOptionId,
  };
}

function toVote(row: VoteRow): core.Vote {
  return { id: row.id, decisionId: row.decisionId, userId: row.userId, optionId: row.optionId };
}

export interface DecisionView {
  decision: core.Decision;
  votes: core.Vote[];
  tally: core.Tally[];
}

function toDecisionView(row: DecisionRow, voteRows: VoteRow[]): DecisionView {
  const decision = toDecision(row);
  const votes = voteRows.map(toVote);
  return { decision, votes, tally: core.tallyVotes(decision.options, votes) };
}

/** Open a decision for a meetup and move the meetup into the deciding state. */
export async function createDecision(
  meetupId: string,
  type: core.DecisionType,
  options: core.DecisionOption[],
  closesAt: Date,
): Promise<core.Decision> {
  const row = await prisma.$transaction(async (tx) => {
    const decision = await tx.gatheringsDecision.create({
      data: { meetupId, type, options: options as unknown as object, closesAt },
    });
    await tx.gatheringsMeetup.update({ where: { id: meetupId }, data: { status: 'deciding' } });
    return decision;
  });
  return toDecision(row);
}

/** Cast or change a vote. Validates the option and that the decision is still open. */
export async function castVote(
  decisionId: string,
  userId: string,
  optionId: string,
): Promise<core.Vote> {
  const decision = await prisma.gatheringsDecision.findUnique({ where: { id: decisionId } });
  if (!decision) throw new Error('decision not found');
  if (decision.status !== 'open') throw new Error('decision is closed');
  const options = decision.options as unknown as core.DecisionOption[];
  if (!options.some((o) => o.id === optionId)) throw new Error(`invalid option: ${optionId}`);

  const row = await prisma.gatheringsVote.upsert({
    where: { decisionId_userId: { decisionId, userId } },
    create: { decisionId, userId, optionId },
    update: { optionId },
  });
  return toVote(row);
}

/** A decision with its votes and tally. */
export async function getDecisionView(decisionId: string): Promise<DecisionView | null> {
  const row = await prisma.gatheringsDecision.findUnique({
    where: { id: decisionId },
    include: { votes: true },
  });
  if (!row) return null;
  return toDecisionView(row, row.votes);
}

/** Open decisions whose voting window has closed — ready to resolve. */
export async function listDueDecisions(now: Date): Promise<core.Decision[]> {
  const rows = await prisma.gatheringsDecision.findMany({
    where: { status: 'open', closesAt: { lte: now } },
  });
  return rows.map(toDecision);
}

/** The votes cast for one decision (for resolution). */
export async function getVotes(decisionId: string): Promise<core.Vote[]> {
  const rows = await prisma.gatheringsVote.findMany({ where: { decisionId } });
  return rows.map(toVote);
}

/** Resolve a decision and write the outcome onto its meetup. */
export async function resolveDecision(
  decisionId: string,
  winningOptionId: string,
  locationText: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const decision = await tx.gatheringsDecision.update({
      where: { id: decisionId },
      data: { status: 'resolved', resolvedOptionId: winningOptionId },
    });
    await tx.gatheringsMeetup.update({
      where: { id: decision.meetupId },
      data: { locationText, status: 'confirmed' },
    });
  });
}

export interface DecisionCloseCandidate {
  meetupId: string;
  groupName: string;
  timezone: string;
  startsAt: Date;
  activeMemberUserIds: string[];
  votedUserIds: string[];
  alreadyRemindedUserIds: string[];
}

/** Open decisions closing soon, with the data to find members who haven't voted. */
export async function findDecisionCloseCandidates(
  now: Date,
  leadHours: number,
): Promise<DecisionCloseCandidate[]> {
  const to = new Date(now.getTime() + leadHours * 3600_000);
  const rows = await prisma.gatheringsDecision.findMany({
    where: { status: 'open', closesAt: { gte: now, lte: to } },
    include: {
      votes: true,
      meetup: {
        include: {
          group: { include: { members: true } },
          reminders: { where: { kind: 'decision_close' } },
        },
      },
    },
  });
  return rows.map((r) => ({
    meetupId: r.meetupId,
    groupName: r.meetup.group.name,
    timezone: r.meetup.group.timezone,
    startsAt: r.meetup.startsAt,
    activeMemberUserIds: r.meetup.group.members
      .filter((m) => m.status === 'active')
      .map((m) => m.userId),
    votedUserIds: r.votes.map((v) => v.userId),
    alreadyRemindedUserIds: r.meetup.reminders.map((x) => x.userId),
  }));
}

// ─── Phase 3: roles, timeline, photos ───────────────────────────────────────────

export async function getGroup(groupId: string): Promise<core.Group | null> {
  const row = await prisma.gatheringsGroup.findUnique({ where: { id: groupId } });
  return row ? toGroup(row) : null;
}

/** Groups the user belongs to (not departed), newest first. */
export async function listGroupsForUser(userId: string): Promise<core.Group[]> {
  const rows = await prisma.gatheringsGroup.findMany({
    where: { members: { some: { userId, status: { not: 'left' } } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toGroup);
}

export async function listMembers(groupId: string): Promise<core.Member[]> {
  const rows = await prisma.gatheringsMember.findMany({ where: { groupId } });
  return rows.map(toMember);
}

export async function getMember(groupId: string, userId: string): Promise<core.Member | null> {
  const row = await prisma.gatheringsMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return row ? toMember(row) : null;
}

export async function setMemberRole(
  groupId: string,
  userId: string,
  role: core.MemberRole,
): Promise<core.Member> {
  const row = await prisma.gatheringsMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role },
  });
  return toMember(row);
}

export interface ListMeetupsOptions {
  before?: Date;
  after?: Date;
  order?: 'asc' | 'desc';
  limit?: number;
}

/** Meetups for a group, filtered/ordered for timeline reads. */
export async function listGroupMeetups(
  groupId: string,
  opts: ListMeetupsOptions = {},
): Promise<core.Meetup[]> {
  const startsAt =
    opts.before || opts.after
      ? { ...(opts.before ? { lt: opts.before } : {}), ...(opts.after ? { gte: opts.after } : {}) }
      : undefined;
  const rows = await prisma.gatheringsMeetup.findMany({
    where: { groupId, ...(startsAt ? { startsAt } : {}) },
    orderBy: { startsAt: opts.order ?? 'asc' },
    take: opts.limit,
  });
  return rows.map(toMeetup);
}

/** Settle meetups that have already started into the `done` state. */
export async function markPastMeetupsDone(now: Date): Promise<number> {
  const res = await prisma.gatheringsMeetup.updateMany({
    where: { startsAt: { lt: now }, status: { in: ['scheduled', 'confirmed', 'deciding'] } },
    data: { status: 'done' },
  });
  return res.count;
}

export async function addPhoto(
  meetupId: string,
  addedByUserId: string,
  url: string,
  caption?: string | null,
): Promise<core.Photo> {
  const row = await prisma.gatheringsPhoto.create({
    data: { meetupId, addedByUserId, url, caption: caption ?? null },
  });
  return toPhoto(row);
}

export async function listPhotos(meetupId: string): Promise<core.Photo[]> {
  const rows = await prisma.gatheringsPhoto.findMany({
    where: { meetupId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(toPhoto);
}

/** Headcount + photos for a set of meetups, keyed by meetup id (timeline support). */
export async function getMeetupExtras(
  meetupIds: string[],
): Promise<Map<string, { headcount: core.Headcount; photos: core.Photo[] }>> {
  const map = new Map<string, { headcount: core.Headcount; photos: core.Photo[] }>();
  if (meetupIds.length === 0) return map;
  const rows = await prisma.gatheringsMeetup.findMany({
    where: { id: { in: meetupIds } },
    include: { rsvps: true, photos: true },
  });
  for (const r of rows) {
    map.set(r.id, {
      headcount: core.headcount(r.rsvps.map(toRsvp)),
      photos: r.photos.map(toPhoto),
    });
  }
  return map;
}
