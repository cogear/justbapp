// Circles engine — in-process API surface. Orchestrates core + data; session-less;
// returns plain data with OPAQUE ids only (never an email or host identity).
//
// This is an approved seam entrypoint: host infrastructure (e.g. the reminders
// cron) may import `@/lib/circles/service`, but still NOT `core` or `data`
// directly. Reminders cross the seam as INTENTS — the engine decides who to
// remind; the host resolves the id to a person and actually delivers. See
// ARCHITECTURE.md.

import * as core from '@/lib/circles/core';
import * as repo from '@/lib/circles/data/repo';

export type ReminderKind = 'pre_meetup' | 'rsvp_cutoff' | 'decision_close';

export interface ReminderIntent {
  kind: ReminderKind;
  /** Opaque host User.id. The engine does not know the person's email. */
  userId: string;
  meetupId: string;
  groupName: string;
  startsAt: Date;
  timezone: string;
}

export interface GenerationResult {
  groupId: string;
  /** Number of cadence occurrences ensured within the horizon (idempotent). */
  meetups: number;
}

/**
 * Materialize each auto-cadence group's upcoming meetups across the rolling
 * horizon. Idempotent (unique on group+startsAt), so it's safe every cron tick.
 */
export async function generateDueMeetups(now: Date = new Date()): Promise<GenerationResult[]> {
  const groups = await repo.listGroupsForGeneration();
  const results: GenerationResult[] = [];
  for (const g of groups) {
    const instants = core.expandCadence(g.defaultCadence, g.timezone, now, core.MEETUP_HORIZON_DAYS);
    try {
      for (const startsAt of instants) {
        const rsvpCutoffAt = new Date(startsAt.getTime() - core.RSVP_CUTOFF_LEAD_HOURS * 3600_000);
        await repo.createMeetup(g.id, startsAt, { rsvpCutoffAt });
      }
      results.push({ groupId: g.id, meetups: instants.length });
    } catch (e) {
      // A group can be deleted between listing and generation. Skip it rather
      // than failing the whole run; the next tick re-evaluates the survivors.
      console.error(`[circles] generation skipped group ${g.id}:`, e);
      results.push({ groupId: g.id, meetups: 0 });
    }
  }
  return results;
}

/**
 * Compute the reminder intents due as of `now`:
 *  - pre_meetup: to everyone who RSVP'd yes to a meetup starting soon.
 *  - rsvp_cutoff: to active members who haven't responded as the cutoff nears.
 * Excludes anyone already reminded for that (meetup, kind).
 */
export async function getDueReminders(now: Date = new Date()): Promise<ReminderIntent[]> {
  const intents: ReminderIntent[] = [];

  const pre = await repo.findPreMeetupCandidates(now, core.PRE_MEETUP_LEAD_HOURS);
  for (const c of pre) {
    const reminded = new Set(c.alreadyRemindedUserIds);
    for (const userId of c.yesUserIds) {
      if (!reminded.has(userId)) {
        intents.push({
          kind: 'pre_meetup',
          userId,
          meetupId: c.meetup.id,
          groupName: c.groupName,
          startsAt: c.meetup.startsAt,
          timezone: c.timezone,
        });
      }
    }
  }

  const cutoff = await repo.findCutoffCandidates(now, core.CUTOFF_NUDGE_LEAD_HOURS);
  for (const c of cutoff) {
    const reminded = new Set(c.alreadyRemindedUserIds);
    const responded = new Set(c.respondedUserIds);
    for (const userId of c.activeMemberUserIds) {
      if (!responded.has(userId) && !reminded.has(userId)) {
        intents.push({
          kind: 'rsvp_cutoff',
          userId,
          meetupId: c.meetup.id,
          groupName: c.groupName,
          startsAt: c.meetup.startsAt,
          timezone: c.timezone,
        });
      }
    }
  }

  const closing = await repo.findDecisionCloseCandidates(now, core.CUTOFF_NUDGE_LEAD_HOURS);
  for (const c of closing) {
    const reminded = new Set(c.alreadyRemindedUserIds);
    const voted = new Set(c.votedUserIds);
    for (const userId of c.activeMemberUserIds) {
      if (!voted.has(userId) && !reminded.has(userId)) {
        intents.push({
          kind: 'decision_close',
          userId,
          meetupId: c.meetupId,
          groupName: c.groupName,
          startsAt: c.startsAt,
          timezone: c.timezone,
        });
      }
    }
  }

  return intents;
}

/** Mark a reminder delivered so it won't fire again (idempotent). */
export async function markReminderSent(
  meetupId: string,
  userId: string,
  kind: ReminderKind,
): Promise<void> {
  await repo.recordReminderSent(meetupId, userId, kind);
}

// ─── decide-step ────────────────────────────────────────────────────────────────

/**
 * Open a decision for a meetup. Requires organizer rights. The decision type is
 * chosen by the group's kind (venue_vote / host_pick / none). `closesAt` defaults
 * to the meetup's RSVP cutoff, else a lead before it starts.
 */
export async function openDecision(
  meetupId: string,
  actingUserId: string,
  options: core.DecisionOption[],
  opts: { closesAt?: Date } = {},
): Promise<core.Decision> {
  const ctx = await repo.getMeetupWithGroup(meetupId);
  if (!ctx) throw new Error('meetup not found');
  await assertOrganizer(ctx.meetup.groupId, actingUserId);

  const type = core.decideStepForKind(ctx.group.kind);
  if (type === 'none') throw new Error(`group kind "${ctx.group.kind}" has no decide-step`);
  if (options.length === 0) throw new Error('at least one option is required');

  const closesAt =
    opts.closesAt ??
    ctx.meetup.rsvpCutoffAt ??
    new Date(ctx.meetup.startsAt.getTime() - core.RSVP_CUTOFF_LEAD_HOURS * 3600_000);

  return repo.createDecision(meetupId, type, options, closesAt);
}

export async function castVote(decisionId: string, userId: string, optionId: string) {
  return repo.castVote(decisionId, userId, optionId);
}

export async function getDecision(decisionId: string) {
  return repo.getDecisionView(decisionId);
}

export interface DecisionResolution {
  decisionId: string;
  meetupId: string;
  winningOptionId: string;
  locationText: string;
}

/** Resolve every decision whose voting window has closed (called by the cron). */
export async function resolveDueDecisions(now: Date = new Date()): Promise<DecisionResolution[]> {
  const due = await repo.listDueDecisions(now);
  const resolutions: DecisionResolution[] = [];
  for (const d of due) {
    const votes = await repo.getVotes(d.id);
    const winningOptionId = core.pickWinner(d.options, votes);
    const option = d.options.find((o) => o.id === winningOptionId)!;
    const { locationText } = core.applyResolution(d.type, option);
    await repo.resolveDecision(d.id, winningOptionId, locationText);
    resolutions.push({ decisionId: d.id, meetupId: d.meetupId, winningOptionId, locationText });
  }
  return resolutions;
}

// ─── Phase 3: roles & permissions ───────────────────────────────────────────────

/** Throw unless `userId` is an owner/co-organizer of the group (and not departed). */
export async function assertOrganizer(groupId: string, userId: string): Promise<void> {
  const member = await repo.getMember(groupId, userId);
  if (!member || member.status === 'left' || !core.hasOrganizerRights(member.role)) {
    throw new Error('requires organizer rights');
  }
}

/** Throw unless `userId` is an active member of the group. */
export async function assertMember(groupId: string, userId: string): Promise<void> {
  const member = await repo.getMember(groupId, userId);
  if (!member || member.status !== 'active') throw new Error('requires active membership');
}

/** Change a member's role between member ↔ co_organizer. Owner-only target is protected. */
export async function setMemberRole(
  groupId: string,
  actingUserId: string,
  targetUserId: string,
  role: 'member' | 'co_organizer',
): Promise<core.Member> {
  await assertOrganizer(groupId, actingUserId);
  const target = await repo.getMember(groupId, targetUserId);
  if (!target) throw new Error('target is not a member');
  if (target.role === 'owner') throw new Error("cannot change the owner's role");
  return repo.setMemberRole(groupId, targetUserId, role);
}

/** Invite a user. Requires organizer rights. */
export async function inviteMember(groupId: string, actingUserId: string, inviteeUserId: string) {
  await assertOrganizer(groupId, actingUserId);
  return repo.inviteMember(groupId, inviteeUserId);
}

/** Create a one-off meetup by hand. Requires organizer rights. */
export async function createMeetupManual(
  groupId: string,
  actingUserId: string,
  startsAt: Date,
  opts: { rsvpCutoffAt?: Date | null } = {},
) {
  await assertOrganizer(groupId, actingUserId);
  return repo.createMeetup(groupId, startsAt, opts);
}

// ─── Phase 3: photos & timeline ─────────────────────────────────────────────────

/** Attach a photo reference to a meetup. Requires active membership. */
export async function addPhoto(
  meetupId: string,
  actingUserId: string,
  url: string,
  caption?: string | null,
): Promise<core.Photo> {
  const ctx = await repo.getMeetupWithGroup(meetupId);
  if (!ctx) throw new Error('meetup not found');
  await assertMember(ctx.meetup.groupId, actingUserId);
  if (!url?.trim()) throw new Error('url is required');
  return repo.addPhoto(meetupId, actingUserId, url, caption);
}

export interface Timeline {
  past: core.TimelineEntry[];
  next: core.TimelineEntry | null;
}

const TIMELINE_PAST_LIMIT = 10;

/** A group's recent past meetups (most recent first) and its next upcoming one. */
export async function getTimeline(groupId: string, now: Date = new Date()): Promise<Timeline> {
  const pastMeetups = await repo.listGroupMeetups(groupId, {
    before: now,
    order: 'desc',
    limit: TIMELINE_PAST_LIMIT,
  });
  const upcoming = await repo.listGroupMeetups(groupId, { after: now, order: 'asc', limit: 1 });
  const next = upcoming.find((m) => m.status !== 'cancelled') ?? null;

  const ids = [...pastMeetups.map((m) => m.id), ...(next ? [next.id] : [])];
  const extras = await repo.getMeetupExtras(ids);
  const toEntry = (m: core.Meetup): core.TimelineEntry => {
    const e = extras.get(m.id);
    return {
      meetup: m,
      headcount: e?.headcount ?? { yes: 0, no: 0, maybe: 0 },
      locationText: m.locationText,
      photos: e?.photos ?? [],
    };
  };

  return { past: pastMeetups.map(toEntry), next: next ? toEntry(next) : null };
}

/** Settle meetups that have already started into `done` (called by the cron). */
export async function markPastMeetupsDone(now: Date = new Date()): Promise<number> {
  return repo.markPastMeetupsDone(now);
}

// ─── Phase 4: agent-facing surface ──────────────────────────────────────────────

/** Create a group (the caller becomes its owner). */
export async function createGroup(input: repo.CreateGroupInput): Promise<core.Group> {
  return repo.createGroup(input);
}

/** Set or change a user's RSVP for a meetup (member-level; trusts the caller's id). */
export async function setRsvp(meetupId: string, userId: string, state: core.RsvpState) {
  return repo.setRsvp(meetupId, userId, state);
}

/** A meetup with rsvps, headcount, decision, and photos. */
export async function getMeetup(meetupId: string): Promise<repo.MeetupView | null> {
  return repo.getMeetupView(meetupId);
}

/** Active members of a meetup's group who have not RSVP'd (for nudging no-replies). */
export async function listNonResponders(meetupId: string): Promise<string[]> {
  const view = await repo.getMeetupView(meetupId);
  if (!view) throw new Error('meetup not found');
  const responded = new Set(view.rsvps.filter((r) => r.state !== 'none').map((r) => r.userId));
  const members = await repo.listMembers(view.meetup.groupId);
  return members
    .filter((m) => m.status === 'active' && !responded.has(m.userId))
    .map((m) => m.userId);
}

export interface GroupOverview {
  group: core.Group;
  next: core.TimelineEntry | null;
  last: core.TimelineEntry | null;
  openDecision: repo.DecisionView | null;
  nonResponders: string[];
}

/** An at-a-glance organizer summary of a group: what's next, who's missing, the vote. */
export async function getGroupOverview(groupId: string): Promise<GroupOverview> {
  const group = await repo.getGroup(groupId);
  if (!group) throw new Error('group not found');

  const timeline = await getTimeline(groupId);
  const next = timeline.next;

  let openDecision: repo.DecisionView | null = null;
  let nonResponders: string[] = [];
  if (next) {
    const view = await repo.getMeetupView(next.meetup.id);
    openDecision = view?.decision?.decision.status === 'open' ? view.decision : null;
    nonResponders = await listNonResponders(next.meetup.id);
  }

  return { group, next, last: timeline.past[0] ?? null, openDecision, nonResponders };
}
