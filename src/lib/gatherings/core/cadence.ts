// @blife/gatherings core — cadence expansion. Pure & deterministic. Uses date-fns /
// date-fns-tz (pure computation, no IO) to turn a group's wall-clock cadence into
// concrete UTC instants. The ban in this layer is on IO/framework/db/host — not
// on deterministic date math. See ARCHITECTURE.md.

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import type { Cadence } from './entities';

const DAY_MS = 86_400_000;

/** Next UTC-midnight civil date (UTC has no DST, so ms arithmetic is exact here). */
function nextCivilDay(d: Date): Date {
  return new Date(d.getTime() + DAY_MS);
}

/** First-of-next-month civil date in UTC. */
function nextCivilMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

// Rolling-horizon + reminder timing defaults (hours/days). Configurable later.
export const MEETUP_HORIZON_DAYS = 28;
export const RSVP_CUTOFF_LEAD_HOURS = 24;
export const PRE_MEETUP_LEAD_HOURS = 24;
export const CUTOFF_NUDGE_LEAD_HOURS = 12;

const WEEKDAYS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

function weekdayToNum(name: string): number {
  const n = WEEKDAYS[name.toLowerCase().slice(0, 3)];
  if (n === undefined) throw new Error(`invalid weekday: ${name}`);
  return n;
}

function parseTime(time: string): { hh: number; mm: number } {
  const [hh, mm] = time.split(':').map((s) => parseInt(s, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) throw new Error(`invalid time: ${time}`);
  return { hh, mm };
}

/** A "civil date" is a UTC-midnight Date used only to iterate calendar days/weekdays. */
function civilDateFromInstant(instant: Date, tz: string): Date {
  const [y, m, d] = formatInTimeZone(instant, tz, 'yyyy-MM-dd').split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Build the UTC instant for a civil date at a wall-clock time in `tz`. */
function instantAt(civil: Date, hh: number, mm: number, tz: string): Date {
  const y = civil.getUTCFullYear();
  const m = String(civil.getUTCMonth() + 1).padStart(2, '0');
  const d = String(civil.getUTCDate()).padStart(2, '0');
  const t = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  return fromZonedTime(`${y}-${m}-${d} ${t}:00`, tz);
}

/**
 * Expand a cadence into the concrete UTC instants that fall in [from, from+horizon].
 * `weekly` and `monthly` interpret `time` as wall-clock in `timezone` (DST-correct);
 * `adhoc` yields nothing (those meetups are created by hand).
 */
export function expandCadence(
  cadence: Cadence,
  timezone: string,
  from: Date,
  horizonDays: number = MEETUP_HORIZON_DAYS,
): Date[] {
  if (cadence.rhythm === 'adhoc') return [];

  const to = new Date(from.getTime() + horizonDays * DAY_MS);
  const out: Date[] = [];

  if (cadence.rhythm === 'weekly') {
    const wanted = new Set(cadence.days.map(weekdayToNum));
    const { hh, mm } = parseTime(cadence.time);
    let cursor = civilDateFromInstant(from, timezone);
    const lastCivil = civilDateFromInstant(to, timezone);
    // Inclusive walk over calendar days from `from`'s local date to `to`'s local date.
    while (cursor.getTime() <= lastCivil.getTime()) {
      if (wanted.has(cursor.getUTCDay())) {
        const instant = instantAt(cursor, hh, mm, timezone);
        if (instant >= from && instant <= to) out.push(instant);
      }
      cursor = nextCivilDay(cursor);
    }
    return dedupeSorted(out);
  }

  // monthly: nth `weekday` of each month touched by the window.
  const wantedDay = weekdayToNum(cadence.weekday);
  const { hh, mm } = parseTime(cadence.time);
  let monthCursor = civilDateFromInstant(from, timezone);
  monthCursor = new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth(), 1));
  const lastCivil = civilDateFromInstant(to, timezone);
  while (
    monthCursor.getUTCFullYear() < lastCivil.getUTCFullYear() ||
    (monthCursor.getUTCFullYear() === lastCivil.getUTCFullYear() &&
      monthCursor.getUTCMonth() <= lastCivil.getUTCMonth())
  ) {
    const occ = nthWeekdayOfMonth(
      monthCursor.getUTCFullYear(),
      monthCursor.getUTCMonth(),
      wantedDay,
      cadence.nth,
    );
    if (occ) {
      const instant = instantAt(occ, hh, mm, timezone);
      if (instant >= from && instant <= to) out.push(instant);
    }
    monthCursor = nextCivilMonth(monthCursor);
  }
  return dedupeSorted(out);
}

/** The nth (1-based) `weekday` in a given UTC month, or null if it doesn't exist. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const candidate = new Date(Date.UTC(year, month, day));
  return candidate.getUTCMonth() === month ? candidate : null;
}

function dedupeSorted(dates: Date[]): Date[] {
  const seen = new Set<number>();
  const out: Date[] = [];
  for (const d of dates.sort((a, b) => a.getTime() - b.getTime())) {
    if (!seen.has(d.getTime())) {
      seen.add(d.getTime());
      out.push(d);
    }
  }
  return out;
}

/** True if `when` falls in the lead window ahead of `now`: now <= when <= now + leadHours. */
export function isWithinWindow(when: Date, now: Date, leadHours: number): boolean {
  const ahead = now.getTime() + leadHours * 3600_000;
  return when.getTime() >= now.getTime() && when.getTime() <= ahead;
}
