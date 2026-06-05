# Circles — Recurring Group Engine

**A modular engine for invite-only recurring groups (dinner clubs, volleyball, board games, coffee, etc.), built inside theblife.com but architected to be extractable into its own product later without a rewrite.**

Working name: **Circles**. Swap freely — the code uses `circles` as a namespace, not a brand.

> **Reconciled with repo reality (2026-06-05).** This revision keeps the four logical-seam rules inviolable (pure domain core, opaque `user_id`, decide-step plugin, cadence-as-data) but softens three expensive *physical* commitments — the npm-package boundary, the dedicated Postgres schema, and the all-HTTP seam — into pragmatic v1 forms that fit the actual stack: a **single flat Next.js app on Vercel, Prisma + Postgres (`public` schema), Stack auth, server actions as the in-app idiom.** Every softened commitment names its extraction-checkpoint upgrade path, so nothing is lost — you just don't pay for extraction you haven't earned yet.

---

## 1. The one rule that makes this work

The group engine is a **bounded context with a hard seam**. It knows *nothing* about the b. life — not the seven principles, not the community feed, not phantom personas. It speaks only its own nouns: Group, Member, Cadence, Meetup, RSVP, Decision.

theblife.com talks to the engine through a thin service surface (server actions in-app, plus `/api/circles/*` and MCP for external callers). **It never imports the engine's domain code and never touches the engine's tables directly.**

That single constraint is the whole game. The day Circles earns its own life, you change *who calls the service* — not the engine.

---

## 2. Package / deploy shape

The three *logical* layers below are real and enforced. In v1 they live as **directories inside the existing flat Next.js app**, not as separate npm packages — the repo has no workspaces/Turborepo today, and standing up a monorepo just to draw a package boundary is extraction tax you haven't earned. The seam is enforced by a **dependency-lint rule** (host code may not import from `circles/core`), which is as binding as a package boundary and far cheaper. Promote `circles/core` to a real `@blife/circles-core` workspace package *at the extraction checkpoint* (§5), not before.

```
theblife.com (host app — Next.js on Vercel)
│
├─ provides: auth, distribution, brand framing, the b. life UI
├─ calls: circles via server actions (in-app) + /api/circles/* (MCP/external)
└─ NEVER imports circles/core, NEVER reads circles_* tables directly
        │
        ▼  (the seam — enforced by dependency-lint, not a package boundary)
        │
circles service  (src/app/circles/actions.ts + src/app/api/circles/* + data module)
│
├─ server actions       in-app mutations (RSVP from a click — the app's idiom)
├─ /api/circles/*        route handlers mirroring the same ops for MCP/external
├─ /api/circles/mcp      MCP tools (decision pending — see §4)
├─ owns tables:          circles_*   (prefixed, in the public schema for v1)
└─ depends on:           src/lib/circles/core
        │
        ▼
src/lib/circles/core   (pure domain — the crown jewel)
│
├─ entities:  Group, Member, Cadence, Meetup, RSVP, Decision
├─ rules:     cadence expansion, RSVP+cutoff, headcount, decide-step
├─ ZERO framework, ZERO db, ZERO next.js, ZERO brand — IO-free pure TS
└─ portable: copy this folder into any future repo and it just works
                     (monorepo packaging deferred to extraction)
```

**Why three layers, not two:** core is framework-free so it survives any future move (own repo, own domain, even a different stack). The service is the swappable shell. The host is replaceable. Value concentrates in the layer that's cheapest to move. Keeping core a pure *directory* rather than a package costs you nothing here — it's still IO-free and still copy-able — while letting Phase 0 ship without touching build/deploy.

---

## 3. Data model

All Circles tables carry a **`circles_` name prefix and live in the existing `public` schema** for v1. The repo runs Prisma against a single schema and uses no Postgres schema namespaces anywhere; forcing a dedicated `circles` PG schema means Prisma multi-schema config for isolation that's actually enforced by code discipline + opaque ids, not by the schema boundary. The prefix gives you the same "never tangle with theblife.com tables" guarantee at zero config cost. (Promoting `circles_*` → a true `circles` PG schema is a clean, mechanical move at the extraction checkpoint.)

The tables below are shown by their logical names; the physical Prisma models are `CirclesGroup`, `CirclesMember`, etc., mapping to `circles_groups`, `circles_members`, ….

> **The opaque-id rule, loudly:** every `user_id` is an opaque **`text`** column with **NO Prisma relation and NO foreign key** to `theblife.com`'s `User` table. This is deliberate and load-bearing — it's what lets the engine sit behind a different auth later. Put this as a comment on every such field in `schema.prisma` so a future session (human or agent) doesn't "helpfully" add a relation and silently break the seam. The **canonical token is the host's DB `User.id` (uuid string)** — the host resolves Stack auth → `User` and passes that id; never Stack's own id, pick one and keep it consistent.

### `circles_groups`
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | "Thursday Volleyball", "Eau Gallie Dinner Club" |
| kind | text | `dinner` \| `sport` \| `boardgames` \| `coffee` \| `generic` — drives which decide-step plugin loads |
| visibility | text | `invite_only` (only value for v1) |
| owner_user_id | text | **opaque string from host auth (the DB `User.id`).** No FK. Engine never resolves it to a person. |
| timezone | text | **IANA tz, e.g. `America/New_York`.** Required. Cadence `time` and all RSVP cutoffs / reminders are interpreted in this zone — without it every reminder fires at the wrong hour. |
| default_cadence | jsonb | see Cadence below |
| created_at | timestamptz | |

### `circles_members`
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| group_id | uuid fk | |
| user_id | text | opaque host id |
| role | text | `owner` \| `co_organizer` \| `member` |
| status | text | `invited` \| `active` \| `left` |
| joined_at | timestamptz | |

### `circles_meetups`
One row per actual gathering (a materialized occurrence, not a recurrence rule).
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| group_id | uuid fk | |
| starts_at | timestamptz | |
| location_text | text | nullable until decided |
| rsvp_cutoff_at | timestamptz | the commitment deadline |
| status | text | `scheduled` \| `deciding` \| `confirmed` \| `done` \| `cancelled` |
| decision_id | uuid fk null | links to a Decision if this meetup needs a vote |

> **`unique(group_id, starts_at)`.** Cadence expansion / "generate next meetup(s)" must be idempotent — calling it twice (a retry, a double cron fire) must not double-create. The unique constraint makes generation safely re-runnable.

### `circles_rsvps`
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| meetup_id | uuid fk | |
| user_id | text | |
| state | text | `yes` \| `no` \| `maybe` \| `none` |
| updated_at | timestamptz | |

### `circles_decisions` (the optional "decide step")
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| meetup_id | uuid fk | |
| type | text | `venue_vote` \| `host_pick` \| `none` |
| options | jsonb | `[{id, label, meta}]` — restaurants, hosts, etc. |
| votes | jsonb | `[{user_id, option_id}]` — **v1 only; see caveat** |
| closes_at | timestamptz | auto-resolves |
| resolved_option_id | text null | |

> **Votes-as-jsonb is a v1 shortcut, not the destination.** A jsonb array enforces no "one vote per user" and races on concurrent writes (two voters read-modify-write the same blob). Acceptable for 6–10-person groups where contention is near zero. When groups grow or you need integrity, migrate to a `circles_votes` table (row per vote) with `unique(decision_id, user_id)`. Flagged so it's a known trade, not a latent bug.

**Cadence** (stored as jsonb on the group, copied onto meetups as they're generated):
```json
{ "rhythm": "weekly",  "days": ["tue","thu"], "time": "18:30" }
{ "rhythm": "monthly", "nth": 1, "weekday": "fri", "time": "19:00" }
{ "rhythm": "adhoc" }
```
A group has a default rhythm; each meetup can inherit or override. The `time` is a wall-clock time **interpreted in the group's `timezone`** (§3) — expansion converts it to a concrete `starts_at` timestamptz per occurrence. Volleyball = fixed weekly, no decide-step. Dinner = monthly, new venue each time via `venue_vote`. Same base, different toppings.

---

## 4. The seam, concretely

Core is called **two ways**, and both delegate to the same `src/lib/circles/core` rules plus a single `circles` data-access module (the only place that touches Prisma). This matches how the app already works — server actions for in-app DB mutations, route handlers for external/MCP — and respects the seam where it actually matters.

**(a) Server actions — the in-app idiom.** UI clicks (RSVP, create group) call typed server actions. This is the codebase's norm and the preferred path for in-app DB access; no need to round-trip every click through HTTP.

```ts
// src/app/circles/actions.ts   'use server'
rsvpAction(meetupId, state)        // resolves current user → User.id, delegates to core+data
createGroupAction(input)
generateNextMeetupAction(groupId)
```

**(b) `/api/circles/*` route handlers — the external/future-host seam.** The same operations, re-exposed over HTTP for MCP and any future host that isn't theblife.com. This is the surface that makes extraction real.

```
POST /api/circles/groups                 create group
POST /api/circles/groups/:id/invite      invite a user_id
POST /api/circles/groups/:id/meetups     generate next meetup(s) from cadence
POST /api/circles/meetups/:id/rsvp       { user_id, state }
GET  /api/circles/meetups/:id            headcount, RSVPs, decision state
POST /api/circles/decisions/:id/vote     { user_id, option_id }
```

Auth rule (both paths): **a verified opaque `user_id` reaches core** — server actions resolve it from the session (`User.id`); route handlers take it from the authenticated caller. The engine trusts it and never does its own login. That's what lets the engine later sit behind a *different* auth without changing core.

**MCP — a deliberate decision, not drift.** The repo already has **two** MCP surfaces that duplicate tool logic: in-process `src/lib/mcp/` exposed at `/api/mcp`, and the standalone `mcp-community/` server. Before adding a third at `/api/circles/mcp`, decide consciously: **(i)** register Circles tools (`create_group`, `rsvp`, `propose_venue`, `get_headcount`…) into the existing in-process server — less surface, reuses transport/auth, but couples Circles to the host's MCP; or **(ii)** stand up a dedicated `/api/circles/mcp` — cleaner for extraction, but compounds the duplication. Either is fine; just choose, and note the choice. This is where the phase-4 organizer agent plugs in — it drives the same rails a human does.

---

## 5. Build order (phases)

**Phase 0 — skeleton & seam.** Stand up `src/lib/circles/core` (entities + rule stubs), the `circles_*` Prisma models in `public`, and one end-to-end vertical slice: create group → invite → one meetup → RSVP yes/no → read headcount. Prove the seam holds (UI/host reaches Circles only via the action/route layer, never imports core; add the dependency-lint rule now). **Test infra is part of Phase 0:** the repo surfaced no test harness, so "one integration test" includes standing up a test DB + runner — budget for it rather than discovering it. If that's too heavy for a first slice, make it an explicit decision (e.g. defer to a thin scripted slice) rather than a silent gap.

**Phase 1 — cadence & reminders.** Cadence expansion (weekly/monthly/adhoc → meetups, idempotent via `unique(group_id, starts_at)`, all timestamps derived from the group `timezone`). RSVP cutoff. Self-sending reminders ("you said yes, see you Thursday"; "venue closes tonight") — these **ride the existing `/api/cron`**, not a new scheduler. This is the volleyball-ready milestone — Robert's group could use it.

**Phase 2 — decide step.** `venue_vote` plugin (propose options, vote, auto-close, write `location_text`). Preference tags to seed options. Dinner-club-ready.

**Phase 3 — history & polish.** "Last time / next time" group timeline. Co-organizers. Discovery within already-connected circles. Optional photos/ratings.

**Phase 4 — agent layer.** Organizer assistant over the MCP surface: drafts invites, nudges no-replies, reads the vote, summarizes the headcount. Only valuable once the rails above exist.

**Extraction checkpoint (anytime after Phase 2):** if usage shows groups that want it *without* the b. life framing, extract. This is the moment the deferred physical commitments get paid for, mechanically: promote `src/lib/circles/core` → a real `@blife/circles-core` workspace package; migrate `circles_*` tables → a dedicated `circles` PG schema (or a separate database); move the action/route layer to its own repo/domain. Because core was kept framework-free and the host only ever reached Circles through the action/route seam (enforced by the dependency-lint rule), each of these is a move, not a rewrite.

---

## 6. Instructions for Claude Code

Paste the block below to Claude Code. It assumes your existing theblife.com Next.js + Vercel + Postgres stack.

```
We're building a modular recurring-group engine called "Circles" inside the
theblife.com repo. The #1 architectural constraint, above all else:

  The engine must be EXTRACTABLE into its own product later without a rewrite.

Enforce these rules at every step. Flag me if anything would violate them:

  1. Three LOGICAL layers, living as directories in this flat Next.js app
     (NOT separate npm packages — we have no workspaces, and a monorepo is
     extraction tax we haven't earned yet):
       src/lib/circles/core  — pure TS domain. IO-free. NO next.js, NO Prisma/
                               db client, NO framework, NO reference to "the
                               b. life", the seven principles, the community
                               feed, or any host concept. Just entities +
                               business rules.
       circles service       — server actions (src/app/circles/actions.ts) for
                               in-app mutations PLUS route handlers under
                               /api/circles/* for MCP/external. Both delegate to
                               circles/core and a single circles data module
                               that is the ONLY place touching Prisma.
       host (theblife.com)   — reaches Circles ONLY through that action/route
                               layer. It must NEVER import circles/core and
                               NEVER read circles_* tables directly. Add a
                               dependency-lint rule enforcing this. If you find
                               yourself wanting to cross it, stop and tell me —
                               that's the seam breaking.

  2. Auth: a verified opaque `user_id` (string) reaches the engine. Server
     actions resolve it from the Stack session → our DB `User.id`; route
     handlers take it from the authenticated caller. The canonical token is
     the DB `User.id` (uuid). The engine does ZERO of its own login/identity
     resolution. Store user_id as an opaque TEXT field everywhere, with NO
     Prisma relation and NO FK to User — comment each such field saying so.

  3. Database: Prisma models prefixed `Circles*` → tables `circles_*` in the
     existing `public` schema (we use no PG schema namespaces today). Never FK
     from circles_* tables into theblife.com tables. (A dedicated `circles` PG
     schema is an extraction-time move, not now.)

  4. Cadence is data, not code: support weekly (multi-day), monthly (nth
     weekday), and adhoc, stored as jsonb. A group has a default cadence;
     each meetup inherits or overrides. Every group has a required IANA
     `timezone`; cadence `time` is wall-clock in that zone and expansion
     derives concrete `starts_at` timestamps from it.

  5. The "decide step" is a pluggable module keyed off group.kind:
     venue_vote (dinner), host_pick (boardgames), none (volleyball). Same
     base meetup flow; the decision is an optional attached object.

Start with PHASE 0 only — do not build ahead:

  - Scaffold src/lib/circles/core with entities Group, Member, Cadence,
    Meetup, RSVP, Decision (types + a few rule functions: addMember,
    rsvp(meetup, user, state), headcount(meetup)). Pure functions, unit
    tested, no IO.
  - Add the `circles_*` Prisma models for the tables in the spec (groups with
    timezone, members, meetups with unique(group_id, starts_at), rsvps,
    decisions) and run prisma migrate.
  - Implement the vertical slice. In-app path = server actions; also expose
    the matching route handlers for the external seam:
        POST /api/circles/groups
        POST /api/circles/groups/:id/invite
        POST /api/circles/groups/:id/meetups   (single meetup for now)
        POST /api/circles/meetups/:id/rsvp
        GET  /api/circles/meetups/:id          (returns headcount + rsvps)
  - Stand up a test DB + runner if none exists (the repo has no test harness),
    then write one integration test for the full vertical slice:
        create group → invite user → create meetup → rsvp yes →
        GET meetup shows headcount of 1.
    If standing up test infra is too much for slice one, tell me and we'll
    decide — don't silently skip the test.
  - Add a short ARCHITECTURE.md in the circles folder restating the 3-layer
    rule, the opaque-id rule, and the extraction seam, so the constraint
    survives future sessions.

Do NOT add cadence expansion, reminders, voting, UI, MCP, or brand framing
yet. Confirm the seam holds and the slice is green, then stop and check in
with me before Phase 1.
```

---

## 7. Naming note (decide later, not blocking)

"Dinner club" is lovely but presumes the activity. For the general engine you want a warmer umbrella that means *the people you keep showing up for* — "Circles" is a placeholder in that spirit. The activity ("Dinner Club", "Thursday Volleyball") becomes the group's *name*; the platform noun stays neutral. Worth aligning with the seven principles before launch, but it doesn't block any of the build above.
