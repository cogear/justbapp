# Circles — Phase 0 Implementation Plan

Companion to [`circles-architecture-spec.md`](./circles-architecture-spec.md). This is the concrete build plan for **Phase 0 only** — the skeleton + seam + one vertical slice — written against this repo's actual patterns (Prisma 5.22 default-export client, Stack auth, server actions for in-app DB access, route handlers for external/MCP).

## Goal & done criteria

One end-to-end slice proves the architecture holds:

> create group → invite a user → create one meetup → RSVP yes → read headcount = 1

**Done when:** the slice runs green through an automated test, the in-app path uses server actions, the external path uses `/api/circles/*` route handlers, both delegate to the same pure core + data module, and a dependency-lint rule fails the build if host code imports `circles/core`.

**Explicitly NOT in Phase 0:** cadence expansion, reminders/cron, voting, any UI components, MCP tools, brand framing. (Timezone is *stored* but no expansion logic yet.)

## Layer map (directories, not packages)

```
src/lib/circles/
  core/                 pure TS — types + rule functions, ZERO io, ZERO next, ZERO prisma
    entities.ts         Group, Member, Cadence, Meetup, Rsvp, Decision (types)
    rules.ts            addMember, rsvp(), headcount(), isValidTimezone()
    index.ts            re-exports
  data/                 the ONLY place that touches Prisma for circles_* tables
    repo.ts             load/save mappers: Prisma row <-> core entity
  ARCHITECTURE.md       restates the 3-layer rule, opaque-id rule, extraction seam

src/app/circles/
  actions.ts            'use server' — in-app slice (createGroup, invite, rsvp, getMeetup...)

src/app/api/circles/
  groups/route.ts                 POST create
  groups/[id]/invite/route.ts     POST invite
  groups/[id]/meetups/route.ts    POST create one meetup
  meetups/[id]/rsvp/route.ts      POST rsvp
  meetups/[id]/route.ts           GET headcount + rsvps

src/lib/auth.ts          NEW shared getOrCreateUser() (lifted from community/actions.ts)
```

## Work breakdown

### 1. Pure core — `src/lib/circles/core/`

Types + pure functions, no imports from `@/lib/*`, no Prisma, no `next`. Mirrors the spec's nouns.

```ts
// entities.ts
export type RsvpState = 'yes' | 'no' | 'maybe' | 'none';
export type MeetupStatus = 'scheduled' | 'deciding' | 'confirmed' | 'done' | 'cancelled';
export type MemberRole = 'owner' | 'co_organizer' | 'member';
export type MemberStatus = 'invited' | 'active' | 'left';
export type GroupKind = 'dinner' | 'sport' | 'boardgames' | 'coffee' | 'generic';

export interface Group { id: string; name: string; kind: GroupKind; visibility: 'invite_only';
  ownerUserId: string; timezone: string; defaultCadence: Cadence; }
export interface Member { id: string; groupId: string; userId: string; role: MemberRole; status: MemberStatus; }
export interface Meetup { id: string; groupId: string; startsAt: Date; locationText: string | null;
  rsvpCutoffAt: Date | null; status: MeetupStatus; decisionId: string | null; }
export interface Rsvp { id: string; meetupId: string; userId: string; state: RsvpState; }
export type Cadence =
  | { rhythm: 'weekly'; days: string[]; time: string }
  | { rhythm: 'monthly'; nth: number; weekday: string; time: string }
  | { rhythm: 'adhoc' };
```

```ts
// rules.ts — pure, unit-testable, no IO
export function headcount(rsvps: Rsvp[]): { yes: number; no: number; maybe: number } { ... }
export function addMember(existing: Member[], userId: string, role: MemberRole): Member  // throws if already active
export function applyRsvp(current: RsvpState, next: RsvpState): RsvpState                 // validation/transition
export function isValidTimezone(tz: string): boolean {                                    // guard before persist
  try { new Intl.DateTimeFormat(undefined, { timeZone: tz }); return true; } catch { return false; }
}
```

Rule functions take plain data and return plain data — the data module does the IO around them.

### 2. Prisma models — `prisma/schema.prisma`

Add models with **`@@map`** to get the `circles_` table prefix (existing models have no `@@map`, so this is a deliberate, isolated convention for circles). **No relation/FK to `User`** — `userId`/`ownerUserId` are bare `String`. Comment loudly.

```prisma
/// OPAQUE host id (DB User.id). DELIBERATELY no relation/FK to User — do not "fix" this.
model CirclesGroup {
  id             String        @id @default(uuid())
  name           String
  kind           String        // GroupKind
  visibility     String        @default("invite_only")
  ownerUserId    String        /// opaque User.id, no FK
  timezone       String        // IANA, e.g. America/New_York
  defaultCadence Json
  createdAt      DateTime      @default(now())
  members        CirclesMember[]
  meetups        CirclesMeetup[]
  @@map("circles_groups")
}

model CirclesMember {
  id        String       @id @default(uuid())
  groupId   String
  userId    String       /// opaque User.id, no FK
  role      String        @default("member")
  status    String        @default("invited")
  joinedAt  DateTime      @default(now())
  group     CirclesGroup  @relation(fields: [groupId], references: [id])
  @@map("circles_members")
}

model CirclesMeetup {
  id           String        @id @default(uuid())
  groupId      String
  startsAt     DateTime
  locationText String?
  rsvpCutoffAt DateTime?
  status       String         @default("scheduled")
  decisionId   String?
  group        CirclesGroup   @relation(fields: [groupId], references: [id])
  rsvps        CirclesRsvp[]
  @@unique([groupId, startsAt])   // idempotent meetup generation
  @@map("circles_meetups")
}

model CirclesRsvp {
  id        String        @id @default(uuid())
  meetupId  String
  userId    String        /// opaque User.id, no FK
  state     String         @default("none")
  updatedAt DateTime       @updatedAt
  meetup    CirclesMeetup  @relation(fields: [meetupId], references: [id])
  @@unique([meetupId, userId])    // one rsvp row per user per meetup
  @@map("circles_rsvps")
}
```

(Decisions table is defined but unused in Phase 0 — include it minimally or defer to Phase 2. Recommend: **defer** to keep Phase 0 tight; the spec's decisions schema lands with `venue_vote`.)

Relations *between* circles models (group↔member↔meetup↔rsvp) are fine and good — the rule is only "no FK out of the circles namespace into theblife tables." Then sync with **`npx prisma db push`** (NOT `migrate dev`): the repo has no `prisma/migrations/` dir and is managed by `db push`; running `migrate dev` against a push-managed DB detects "drift" and offers a destructive reset. `db push` applies the additive `circles_*` tables non-destructively (it aborts rather than dropping data).

### 3. Data module — `src/lib/circles/data/repo.ts`

The single Prisma-touching module for circles. Imports `@/lib/prisma` and `core`; maps rows ↔ entities; runs core rules in the middle.

```ts
import prisma from '@/lib/prisma';
import * as core from '@/lib/circles/core';

export async function createGroup(input: {...}): Promise<core.Group> {
  if (!core.isValidTimezone(input.timezone)) throw new Error('invalid timezone');
  const row = await prisma.circlesGroup.create({ data: {...} });
  // also create the owner CirclesMember (role owner, status active)
  return toGroup(row);
}
export async function inviteMember(groupId: string, userId: string) { ... }   // upsert on (groupId,userId)
export async function createMeetup(groupId: string, startsAt: Date) { ... }   // relies on @@unique for idempotency
export async function setRsvp(meetupId: string, userId: string, state: core.RsvpState) {
  return prisma.circlesRsvp.upsert({ where: { meetupId_userId: { meetupId, userId } }, ... });
}
export async function getMeetupView(meetupId: string) {                       // returns headcount + rsvps
  const rsvps = await prisma.circlesRsvp.findMany({ where: { meetupId } });
  return { rsvps: rsvps.map(toRsvp), headcount: core.headcount(rsvps.map(toRsvp)) };
}
```

### 4. Shared auth helper — `src/lib/auth.ts` (new)

`getOrCreateUser()` currently lives privately in `src/app/community/actions.ts:7`. Lift it verbatim into `@/lib/auth` so both that file and Circles use one copy. The canonical opaque token is `user.id` (the DB `User.id` uuid). Update `community/actions.ts` to import it (small, safe refactor).

### 5. In-app server actions — `src/app/circles/actions.ts`

Mirrors the `community/actions.ts` shape: `'use server'`, resolve user via `getOrCreateUser()`, return `{ error }` / `{ success }` objects (the codebase's convention — client shows a `sonner` toast, never an alert/dialog per project rules), `revalidatePath` where a page exists.

```ts
'use server';
import { getOrCreateUser } from '@/lib/auth';
import * as repo from '@/lib/circles/data/repo';

export async function createGroupAction(input: {...}) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };
  try { const g = await repo.createGroup({ ...input, ownerUserId: user.id }); return { success: true, group: g }; }
  catch (e) { console.error(e); return { error: 'Failed to create group' }; }
}
export async function rsvpAction(meetupId: string, state: core.RsvpState) {
  const user = await getOrCreateUser();
  if (!user) return { error: 'Not authenticated' };
  await repo.setRsvp(meetupId, user.id, state);
  return { success: true };
}
// inviteAction, createMeetupAction, getMeetupAction ... same shape
```

### 6. External route handlers — `src/app/api/circles/*`

The same operations over HTTP for MCP/external/future-host. Gate with the existing `authenticate(request)` from `@/lib/api-auth` (Bearer `MCP_API_KEY`); take the opaque `user_id` from the request body (the external caller is responsible for it — the engine trusts it). Each handler is a thin wrapper over `repo.*`.

```ts
// src/app/api/circles/meetups/[id]/rsvp/route.ts
import { authenticate, unauthorized } from '@/lib/api-auth';
import * as repo from '@/lib/circles/data/repo';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(req)) return unauthorized();
  const { user_id, state } = await req.json();
  await repo.setRsvp((await params).id, user_id, state);
  return NextResponse.json({ ok: true });
}
```

(Note: Next 16 / App Router — `params` is async, `await params`.)

### 7. Dependency-lint seam — ESLint flat config

The seam is only real if it's enforced. Add to `eslint.config.*`:

- A global rule: `no-restricted-imports` banning `@/lib/circles/core` and `@/lib/circles/data` everywhere…
- …re-enabled (override turns the rule off) **only** for files under `src/lib/circles/**`, `src/app/circles/**`, `src/app/api/circles/**`.

Result: if any host component or unrelated action imports circles internals, `npm run lint` (and `build`) fails. Add a one-line comment pointing back to `ARCHITECTURE.md`. The companion "host must not read `circles_*` tables" rule is weaker to lint mechanically; enforce by convention — `prisma.circles*` calls live only in `data/repo.ts` — and note it in `ARCHITECTURE.md` for review.

### 8. Test infra + the integration test — the one real decision

There is **no test framework in the repo today**. Phase 0's "one integration test" therefore includes choosing one. Two grounded options:

- **(A) Vitest + a real test Postgres** (recommended). Add `vitest` dev-dep and a `test` script; point `DATABASE_URL`/`DIRECT_URL` at a scratch DB (local Docker Postgres or a Neon/Supabase branch). Test drives the slice through `repo.*` (or the server actions), asserts `headcount.yes === 1`, truncates `circles_*` between runs. ~Most faithful, reusable for later phases.
- **(B) A `tsx` script** (`scripts/circles-smoke.ts`, like the existing `seed:courses`) that runs the slice against a scratch DB and asserts. Zero new framework, lighter, but not a real test runner.

**Recommendation:** A, because Phases 1–2 (cadence expansion, vote resolution) will want unit tests on the pure `core` rules anyway, and Vitest runs those with no DB. If standing up a test DB is too much for slice one, fall back to B and say so out loud — don't silently skip the assertion. **This choice should be confirmed with David before building** (it's the only part that adds a dependency + infra).

### 9. `ARCHITECTURE.md` in `src/lib/circles/`

Short. Restates: (1) three layers as directories, core is pure/IO-free; (2) opaque-id rule, no FK to User, canonical token = `User.id`; (3) the dependency-lint seam and the data-module-only-touches-Prisma convention; (4) the extraction checkpoint upgrade path. So the constraints survive future sessions.

## Build order (within Phase 0)

1. `core/` types + rules + unit tests (no DB needed) — fastest feedback.
2. Prisma models + `prisma db push` (repo is db-push-managed; never `migrate dev` here).
3. `src/lib/auth.ts` lift + `data/repo.ts`.
4. Server actions, then route handlers.
5. ESLint seam rule (verify it actually fails on a deliberate bad import, then remove the probe).
6. Test infra + integration test green.
7. `ARCHITECTURE.md`.

## Verification

- `npm run lint` passes; add a throwaway `import ... from '@/lib/circles/core'` in a host file and confirm lint **fails**, then delete it (proves the seam bites).
- `npx prisma db push` applies; `circles_*` tables exist; an information_schema check shows **no FK** from `circles_*` to `User` (only circles→circles FKs).
- Integration test green: the full slice yields headcount `{ yes: 1 }`.
- Manual external-path check (optional): `curl` the `/api/circles/*` endpoints with the `MCP_API_KEY` bearer to confirm the same slice works over HTTP.
- `npm run build` succeeds (runs `prisma generate` + lint).
- Then **stop and check in** before Phase 1, per the spec.

## Open decisions to confirm with David

1. **Test framework: Vitest + scratch DB (A) vs tsx smoke script (B).** Recommend A.
2. **Decisions table now or in Phase 2?** Recommend defer to Phase 2 (keeps Phase 0 to the slice).
3. **Scratch DB source** for tests: local Docker Postgres vs a Neon/Supabase branch off the existing DB.
