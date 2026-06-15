# Gatherings — architecture & the seam (read before changing anything here)

Gatherings is a **bounded context** living inside theblife.com. It is built to be
**extractable into its own product later without a rewrite**. Full spec:
`docs/gatherings-architecture-spec.md`; Phase 0 build plan: `docs/gatherings-phase0-plan.md`.

## Three layers (directories, not packages — yet)

```
src/lib/gatherings/core    pure TS domain: entities + rules + cadence expansion.
                        ZERO next, ZERO Prisma, ZERO IO, ZERO "b. life"/host.
                        May use pure, deterministic date libs (date-fns/-tz) —
                        the ban is on IO/framework/db/host, not computation.
src/lib/gatherings/data    the ONLY place that touches Prisma for gatherings_* tables.
                        Maps rows <-> core entities; runs core rules in between.
src/lib/gatherings/service in-process engine API (orchestrates core+data, session-
                        less, opaque ids only). Host infra MAY import this.
src/app/gatherings/*       in-app server actions (the host UI calls these).
src/app/api/gatherings/*   route handlers mirroring the same ops for MCP/external.
```

The host (everything else in theblife.com) reaches Gatherings **only** through the
**service module, server actions, and route handlers**. It must never import
`gatherings/core` or `gatherings/data`, and never read `gatherings_*` tables directly.
`gatherings/service` is the approved in-process entrypoint for host infrastructure
(e.g. the reminders cron) — it is deliberately *not* in the lint's banned
patterns, while `core` and `data` are.

## Schedule type

A gathering carries a `scheduleType`: `single` (one occurrence), `recurring_static`
(fixed weekly/monthly cadence — `generateDueMeetups`/`generateForGroup` materialize
upcoming occurrences), or `recurring_flexible` (recurs, but each occurrence is set by
hand). Static gatherings hold a weekly/monthly `cadence`; single and flexible hold
`adhoc`, so generation is a no-op for them. **Occurrences are an internal concept**
(the `Meetup` entity / `gatherings_meetups`); the product surfaces only "gatherings"
and their dates — there is no user-facing "meetup".

## The decide-step (Phase 2)

A meetup can carry a **decision** — propose options, members vote, it auto-closes,
the winner is written onto the meetup. The decide-step is **pluggable, keyed off
`group.kind`** (`core.DECIDE_STEP_BY_KIND`): dinner/coffee → `venue_vote`
(writes the venue to `locationText`), boardgames → `host_pick` (writes the host),
sport/generic → `none`. One generic voting engine backs both. Votes live in
`gatherings_votes` with `@@unique(decisionId, userId)` (one vote per user — not a
jsonb blob). Resolution is deterministic: plurality, ties broken by proposal
order, zero votes → first option. Decisions **auto-close on the cron** via
`service.resolveDueDecisions(now)`, alongside a `decision_close` "vote now"
reminder for members who haven't voted.

## Roles, timeline & photos (Phase 3)

- **Roles & permissions.** Members are `owner | co_organizer | member`. Organizer
  operations — invite, manual create-meetup, open-decision, role changes — are
  gated by `service.assertOrganizer(groupId, actingUserId)` (`core.hasOrganizerRights`).
  RSVP / vote / photo are member-level. Cadence generation is a system action (no
  actor). Enforcement lives in the **service** via an explicit `actingUserId`, so
  both the in-app actions (current user) and the routes (`acting_user_id` in body)
  go through the same check. `repo.*` stays mechanical and unchecked.
- **Timeline.** `service.getTimeline(groupId)` returns recent past meetups + the
  next upcoming one (each with headcount, location, photos). The cron calls
  `markPastMeetupsDone(now)` to settle started meetups into `done`.
- **Photos are references only.** `gatherings_photos.url` is an opaque URL; the engine
  never uploads. The actual S3 upload flow is host/UI work (deferred).

## The agent surface (Phase 4)

Gatherings exposes a **standalone MCP server** at `/api/gatherings/mcp` (built by
`src/lib/gatherings/mcp/server.ts`, tools in `mcp/tools.ts`) so a connected agent
can run a group — create/invite/schedule, open a vote, read the tally, list
who hasn't responded, and summarize via `gatherings_group_overview`. The tools are
host adapters over `service` (opaque ids only, never identity); the agent is
Claude driving the rails, not a separate bot. It's a *separate* endpoint from the
community MCP (`/api/mcp`) and lives inside `gatherings/`, so it travels with the
engine on extraction.

## Reminders cross the seam as intents

The engine holds only opaque `userId` text and cannot resolve an email. So
reminder delivery is **host-mediated**: `service.getDueReminders()` returns
intents (`{ kind, userId, meetupId, ... }`, opaque ids only); the host cron
(`src/app/api/cron/gatherings-reminders`) resolves `userId → User.email`, sends via
Resend, then calls `service.markReminderSent()`. The engine decides *who and
why*; the host performs *delivery*. A `gatherings_reminders` row with
`@@unique(meetupId, userId, kind)` makes sending idempotent across cron ticks.

## The four inviolable rules

1. **Pure core.** `core/` imports nothing from `@/lib/*`, no Prisma, no `next`.
   If a rule needs IO, the IO lives in `data/` and calls the pure function.
2. **Opaque ids.** Every `userId`/`ownerUserId` is plain `String` text — the DB
   `User.id` — with **NO Prisma relation and NO foreign key** to `User`. This is
   deliberate and load-bearing; it's what lets the engine sit behind a different
   auth later. Do not "fix" it by adding a relation.
3. **Cadence is data**, stored as jsonb; **the decide-step is a plugin** keyed off
   `group.kind` (Phase 2). Same base meetup flow, optional attached decision.
4. **`gatherings_` table prefix** in the `public` schema (via Prisma `@@map`). No FK
   out of the gatherings namespace into theblife tables.

## How the seam is enforced

- **Dependency-lint** (`eslint.config.mjs`): `no-restricted-imports` bans
  `@/lib/gatherings/core` and `@/lib/gatherings/data` everywhere, re-enabled only under
  `src/lib/gatherings/**`, `src/app/gatherings/**`, `src/app/api/gatherings/**`. Crossing
  the seam fails `npm run lint` / `npm run build`.
- **Convention:** `prisma.gatherings*` calls live only in `data/repo.ts`. (Not
  machine-enforced — uphold it in review.)

## Tests

- `core/*.test.ts` — pure unit tests, no DB.
- `data/*.integration.test.ts` — runs against the current `DATABASE_URL`, uses
  synthetic opaque userIds (never creates a real `User`), and cleans up by
  deleting rows scoped to the group it created. **Never** `TRUNCATE` or
  `deleteMany({})` on `gatherings_*`.

## Extraction checkpoint (later)

When usage justifies a standalone product: promote `core/` to a real
`@blife/gatherings-core` workspace package; migrate `gatherings_*` → a dedicated
`gatherings` PG schema (or separate DB); move the action/route layer to its own
repo. Because core is framework-free and the host only ever used the seam, each
is a move, not a rewrite.
