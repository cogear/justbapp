import { describe, expect, it } from 'vitest';
import { formatInTimeZone } from 'date-fns-tz';
import { expandCadence, isWithinWindow } from './cadence';
import type { Cadence } from './entities';

const TZ = 'America/New_York';

// Render an instant back into the group's wall clock, to assert the local time is
// stable even when the UTC offset changes across DST.
const wall = (d: Date) => formatInTimeZone(d, TZ, 'yyyy-MM-dd HH:mm zzz');

describe('expandCadence — weekly', () => {
  it('emits each requested weekday at the wall-clock time', () => {
    const cadence: Cadence = { rhythm: 'weekly', days: ['tue', 'thu'], time: '18:30' };
    const from = new Date('2026-07-01T00:00:00Z'); // Wed
    const out = expandCadence(cadence, TZ, from, 7);
    // Within a week from Wed Jul 1: Thu Jul 2 and Tue Jul 7.
    expect(out.map((d) => wall(d))).toEqual([
      '2026-07-02 18:30 EDT',
      '2026-07-07 18:30 EDT',
    ]);
  });

  it('keeps 18:30 local across the autumn DST change (EDT→EST)', () => {
    // US DST ends Sun Nov 1, 2026. A Sunday cadence spanning it must stay 18:30 local
    // even though the UTC offset shifts from -04:00 to -05:00.
    const cadence: Cadence = { rhythm: 'weekly', days: ['sun'], time: '18:30' };
    const from = new Date('2026-10-25T00:00:00Z'); // Sun
    const out = expandCadence(cadence, TZ, from, 15);
    expect(out.map((d) => wall(d))).toEqual([
      '2026-10-25 18:30 EDT',
      '2026-11-01 18:30 EST', // same wall time, different offset → different UTC instant
      '2026-11-08 18:30 EST',
    ]);
    // The Oct 25 and Nov 1 instants are 7*24+1 = 169 hours apart (not 168) due to the fall-back.
    const hours = (out[1].getTime() - out[0].getTime()) / 3600_000;
    expect(hours).toBe(169);
  });
});

describe('expandCadence — monthly', () => {
  it('emits the nth weekday of each month in range', () => {
    const cadence: Cadence = { rhythm: 'monthly', nth: 1, weekday: 'fri', time: '19:00' };
    const from = new Date('2026-07-01T00:00:00Z');
    const out = expandCadence(cadence, TZ, from, 70); // ~2.3 months
    expect(out.map((d) => wall(d))).toEqual([
      '2026-07-03 19:00 EDT', // 1st Friday of July
      '2026-08-07 19:00 EDT', // 1st Friday of August
      '2026-09-04 19:00 EDT', // 1st Friday of September
    ]);
  });
});

describe('expandCadence — adhoc', () => {
  it('yields nothing', () => {
    expect(expandCadence({ rhythm: 'adhoc' }, TZ, new Date(), 28)).toEqual([]);
  });
});

describe('isWithinWindow', () => {
  const now = new Date('2026-07-01T12:00:00Z');
  it('includes times inside the lead window', () => {
    expect(isWithinWindow(new Date('2026-07-01T20:00:00Z'), now, 24)).toBe(true);
    expect(isWithinWindow(now, now, 24)).toBe(true);
  });
  it('excludes past times and times beyond the window', () => {
    expect(isWithinWindow(new Date('2026-07-01T11:59:00Z'), now, 24)).toBe(false);
    expect(isWithinWindow(new Date('2026-07-03T12:00:00Z'), now, 24)).toBe(false);
  });
});
