# Database migrations

## Never run `prisma db push` against the live database

The Neon database carries columns that are not in `main`'s `schema.prisma`, from
branches that shipped their schema before their code merged. `db push` reconciles
the database *to* the schema file, so anything the file doesn't know about gets
dropped — silently, with real data in it.

Known drift as of 2026-08-07:

| Object | Owner | Status |
|---|---|---|
| `Lesson.freePreview` | `feat/gate-course-videos` (commit `c3d5561`) | **live, 20 rows true / 512 false** — not in `main` |
| `gatherings_*` (9 tables) | `feat/circles-engine` | now in `main`'s schema; no longer at risk |

Check for current drift before any schema work:

```bash
set -a; source .env; set +a
npx prisma migrate diff --from-url "$DIRECT_URL" \
  --to-schema-datamodel prisma/schema.prisma --script
```

Anything that prints is a column or table the live database has and `main` does
not. Treat every line as data you would destroy.

## The safe procedure

Diff **datamodel → datamodel**, never `--from-url`. `--from-schema-datamodel`
has no knowledge of the live database, so it is structurally incapable of
emitting a `DROP` for drift it can't see.

```bash
set -a; source .env; set +a

# 1. Snapshot. Keep this; you diff against it at the end.
psql "$DIRECT_URL" -Atc \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" > /tmp/tables-before.txt
git show HEAD:prisma/schema.prisma > /tmp/schema-before.prisma

# 2. Edit prisma/schema.prisma.

# 3. Generate the delta.
npx prisma migrate diff \
  --from-schema-datamodel /tmp/schema-before.prisma \
  --to-schema-datamodel   prisma/schema.prisma \
  --script > /tmp/migration.sql

# 4. GATE — must print nothing. If it prints, stop and read the SQL.
grep -Ei 'drop|truncate|delete from' /tmp/migration.sql
cat /tmp/migration.sql

# 5. Apply. Use --url "$DIRECT_URL": a bare --schema resolves to the pooled
#    Neon endpoint, which is wrong for DDL.
npx prisma db execute --url "$DIRECT_URL" --file /tmp/migration.sql

# 6. Verify nothing was lost.
psql "$DIRECT_URL" -Atc \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" > /tmp/tables-after.txt
diff /tmp/tables-before.txt /tmp/tables-after.txt   # must be empty

npx prisma generate
```

`prisma db execute` runs statements but does not print `SELECT` output — use
`psql "$DIRECT_URL" -c "..."` for every verification query.

## Adding a required column to a populated table

Postgres rejects `ADD COLUMN ... NOT NULL` without a default on a non-empty
table, and adding `DEFAULT ''` would immediately violate any unique index you
plan to add. Split it into two migrations with a backfill between:

1. Add the column nullable, plus any plain (non-unique) indexes.
2. Backfill.
3. `SET NOT NULL` and create the unique indexes.

Generate migration 2 by diffing against a copy of the *nullable* schema, so
Prisma's generated index names match what the client expects
(`Model_field1_field2_key`).

This is how `Module.slug` and `Lesson.slug` were added — see
`scripts/backfill-course-slugs.ts`.

## Deploy ordering

Apply SQL to Neon **before** deploying the code that uses it. An additive
nullable column is invisible to running code; deploying a `schema.prisma` with
fields the database lacks breaks every query against that table.
