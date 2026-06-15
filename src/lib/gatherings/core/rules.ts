// @blife/gatherings core — pure business rules. No IO, no framework. Unit-testable in isolation.

import type { Headcount, Member, MemberRole, Rsvp, RsvpState } from './entities';

/** Tally RSVPs into a headcount. `none` is intentionally not counted. */
export function headcount(rsvps: Rsvp[]): Headcount {
  const counts: Headcount = { yes: 0, no: 0, maybe: 0 };
  for (const r of rsvps) {
    if (r.state === 'yes') counts.yes++;
    else if (r.state === 'no') counts.no++;
    else if (r.state === 'maybe') counts.maybe++;
  }
  return counts;
}

/**
 * Decide the member record for adding a user to a group. Pure: returns the new
 * Member shape (sans persistence). Throws if the user is already an active member.
 */
export function addMember(
  existing: Member[],
  userId: string,
  role: MemberRole = 'member',
  status: Member['status'] = 'invited',
): Omit<Member, 'id' | 'groupId'> {
  const active = existing.find((m) => m.userId === userId && m.status !== 'left');
  if (active) {
    throw new Error(`user ${userId} is already a ${active.status} member`);
  }
  return { userId, role, status };
}

/** Validate an RSVP transition. v1 allows any move between the four states. */
export function applyRsvp(_current: RsvpState, next: RsvpState): RsvpState {
  return next;
}

/** Owners and co-organizers may run the group (invite, schedule, open decisions). */
export function hasOrganizerRights(role: MemberRole): boolean {
  return role === 'owner' || role === 'co_organizer';
}

/** True if `tz` is a valid IANA timezone the runtime can resolve. */
export function isValidTimezone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
