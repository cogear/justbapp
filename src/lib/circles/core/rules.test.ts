import { describe, expect, it } from 'vitest';
import { addMember, applyRsvp, hasOrganizerRights, headcount, isValidTimezone } from './rules';
import type { Member, Rsvp } from './entities';

const rsvp = (userId: string, state: Rsvp['state']): Rsvp => ({
  id: `r-${userId}`,
  meetupId: 'm1',
  userId,
  state,
});

describe('headcount', () => {
  it('tallies yes/no/maybe and ignores none', () => {
    const result = headcount([
      rsvp('a', 'yes'),
      rsvp('b', 'yes'),
      rsvp('c', 'no'),
      rsvp('d', 'maybe'),
      rsvp('e', 'none'),
    ]);
    expect(result).toEqual({ yes: 2, no: 1, maybe: 1 });
  });

  it('is zero for an empty list', () => {
    expect(headcount([])).toEqual({ yes: 0, no: 0, maybe: 0 });
  });
});

describe('addMember', () => {
  const member = (userId: string, status: Member['status']): Member => ({
    id: `m-${userId}`,
    groupId: 'g1',
    userId,
    role: 'member',
    status,
  });

  it('returns an invited member by default', () => {
    expect(addMember([], 'u1')).toEqual({ userId: 'u1', role: 'member', status: 'invited' });
  });

  it('throws if the user is already active', () => {
    expect(() => addMember([member('u1', 'active')], 'u1')).toThrow();
  });

  it('allows re-adding a user who left', () => {
    expect(() => addMember([member('u1', 'left')], 'u1')).not.toThrow();
  });
});

describe('applyRsvp', () => {
  it('returns the next state', () => {
    expect(applyRsvp('none', 'yes')).toBe('yes');
    expect(applyRsvp('yes', 'no')).toBe('no');
  });
});

describe('hasOrganizerRights', () => {
  it('grants owner and co_organizer, denies member', () => {
    expect(hasOrganizerRights('owner')).toBe(true);
    expect(hasOrganizerRights('co_organizer')).toBe(true);
    expect(hasOrganizerRights('member')).toBe(false);
  });
});

describe('isValidTimezone', () => {
  it('accepts valid IANA zones', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('UTC')).toBe(true);
  });

  it('rejects junk and empty', () => {
    expect(isValidTimezone('Not/AZone')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});
