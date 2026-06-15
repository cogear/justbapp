// @blife/gatherings core — pure domain types. ZERO framework, ZERO db, ZERO next, ZERO brand.
// Do not import from @/lib/* or any host concept here. See ARCHITECTURE.md.

export type GroupKind = 'dinner' | 'sport' | 'boardgames' | 'coffee' | 'generic';
export type GroupVisibility = 'invite_only';

export type MemberRole = 'owner' | 'co_organizer' | 'member';
export type MemberStatus = 'invited' | 'active' | 'left';

export type MeetupStatus = 'scheduled' | 'deciding' | 'confirmed' | 'done' | 'cancelled';

export type RsvpState = 'yes' | 'no' | 'maybe' | 'none';

export type Cadence =
  | { rhythm: 'weekly'; days: string[]; time: string }
  | { rhythm: 'monthly'; nth: number; weekday: string; time: string }
  | { rhythm: 'adhoc' };

/**
 * How a gathering is scheduled. A `single` gathering happens once; a
 * `recurring_static` one repeats on a fixed cadence (auto-generated); a
 * `recurring_flexible` one repeats but each occurrence is set/decided as it goes.
 */
export type ScheduleType = 'single' | 'recurring_static' | 'recurring_flexible';

export interface Group {
  id: string;
  name: string;
  kind: GroupKind;
  visibility: GroupVisibility;
  /** Opaque host id (the DB User.id). The engine never resolves it to a person. */
  ownerUserId: string;
  /** IANA timezone, e.g. "America/New_York". Cadence times are interpreted here. */
  timezone: string;
  scheduleType: ScheduleType;
  defaultCadence: Cadence;
}

export interface Member {
  id: string;
  groupId: string;
  /** Opaque host id (the DB User.id). No relation/FK to any host table. */
  userId: string;
  role: MemberRole;
  status: MemberStatus;
}

export interface Meetup {
  id: string;
  groupId: string;
  startsAt: Date;
  locationText: string | null;
  /** Google Places place id, when the location was picked from autocomplete. */
  locationPlaceId: string | null;
  rsvpCutoffAt: Date | null;
  status: MeetupStatus;
}

export interface Rsvp {
  id: string;
  meetupId: string;
  /** Opaque host id (the DB User.id). */
  userId: string;
  state: RsvpState;
}

export interface Headcount {
  yes: number;
  no: number;
  maybe: number;
}

// ─── decide-step ────────────────────────────────────────────────────────────────

export type DecisionType = 'venue_vote' | 'host_pick' | 'none';
export type DecisionStatus = 'open' | 'resolved' | 'cancelled';

export interface DecisionOption {
  id: string;
  label: string;
  meta?: Record<string, unknown>;
}

export interface Decision {
  id: string;
  meetupId: string;
  type: DecisionType;
  options: DecisionOption[];
  status: DecisionStatus;
  closesAt: Date;
  resolvedOptionId: string | null;
}

export interface Vote {
  id: string;
  decisionId: string;
  /** Opaque host User.id. */
  userId: string;
  optionId: string;
}

// ─── history & polish ───────────────────────────────────────────────────────────

export interface Photo {
  id: string;
  meetupId: string;
  /** Opaque host User.id of whoever added it. */
  addedByUserId: string;
  /** A reference URL; the host owns the actual upload. */
  url: string;
  caption: string | null;
  createdAt: Date;
}

export interface TimelineEntry {
  meetup: Meetup;
  headcount: Headcount;
  locationText: string | null;
  photos: Photo[];
}
