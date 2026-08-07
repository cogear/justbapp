/**
 * Backfill `Module.slug` and `Lesson.slug` from their titles.
 *
 * A published slug is a permanent public URL. The default run therefore only
 * *fills nulls* — it never rewrites a slug that already exists, so re-running is
 * a no-op and existing URLs can't drift. Use `--reslug` for a deliberate rename;
 * it prints an old→new map so every changed URL can be given a redirect.
 *
 *   npx tsx scripts/backfill-course-slugs.ts --dry-run
 *   npx tsx scripts/backfill-course-slugs.ts
 *   npx tsx scripts/backfill-course-slugs.ts --course the-quiet-crafts
 *   npx tsx scripts/backfill-course-slugs.ts --reslug --dry-run
 */
import prisma from '../src/lib/prisma';
import { slugify } from '../src/lib/slugify';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RESLUG = args.includes('--reslug');
const COURSE_FILTER = (() => {
    const i = args.indexOf('--course');
    return i >= 0 ? args[i + 1] : undefined;
})();

interface Row {
    id: string;
    title: string;
    order: number;
    slug: string | null;
}

interface Assignment {
    id: string;
    title: string;
    from: string | null;
    to: string;
}

/**
 * Two passes over one uniqueness scope (a course's modules, or a module's
 * lessons).
 *
 * Pass A claims every slug that already exists. Pass B only then assigns to the
 * unclaimed rows, suffixing -2, -3, ... on collision. Claiming first is what
 * makes the script idempotent and what stops a newly-retitled row from stealing
 * a sibling's established slug.
 *
 * Rows arrive sorted by (order, id), a total and stable ordering, so the same
 * input always yields the same suffix assignment.
 */
function assignSlugs(rows: Row[], kind: 'module' | 'lesson'): Assignment[] {
    const taken = new Set<string>();
    const assignments: Assignment[] = [];

    // Pass A — claim existing.
    if (!RESLUG) {
        for (const row of rows) {
            if (row.slug) taken.add(row.slug);
        }
    }

    // Pass B — assign.
    for (const row of rows) {
        if (row.slug && !RESLUG) continue;

        const base = slugify(row.title) || `${kind}-${row.order}`;
        let candidate = base;
        let n = 1;
        while (taken.has(candidate)) {
            n += 1;
            candidate = `${base}-${n}`;
        }
        taken.add(candidate);

        if (row.slug === candidate) continue; // --reslug produced no change
        assignments.push({ id: row.id, title: row.title, from: row.slug, to: candidate });
    }

    return assignments;
}

async function main() {
    const courses = await prisma.course.findMany({
        where: COURSE_FILTER ? { space: { slug: COURSE_FILTER } } : undefined,
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            title: true,
            space: { select: { slug: true } },
            modules: {
                orderBy: [{ order: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    title: true,
                    order: true,
                    slug: true,
                    lessons: {
                        orderBy: [{ order: 'asc' }, { id: 'asc' }],
                        select: { id: true, title: true, order: true, slug: true },
                    },
                },
            },
        },
    });

    if (courses.length === 0) {
        console.error(COURSE_FILTER ? `No course found for space "${COURSE_FILTER}".` : 'No courses found.');
        process.exit(1);
    }

    let moduleWrites = 0;
    let lessonWrites = 0;
    const renames: string[] = [];

    for (const course of courses) {
        console.log(`\n${course.space.slug}  (${course.title})`);

        const moduleAssignments = assignSlugs(course.modules, 'module');
        const moduleSlugById = new Map(course.modules.map(m => [m.id, m.slug]));
        for (const a of moduleAssignments) moduleSlugById.set(a.id, a.to);

        for (const a of moduleAssignments) {
            if (a.from) renames.push(`  ${course.space.slug}/${a.from}  ->  ${course.space.slug}/${a.to}`);
            if (!DRY_RUN) {
                await prisma.module.update({ where: { id: a.id }, data: { slug: a.to } });
            }
            moduleWrites++;
        }

        for (const mod of course.modules) {
            const modSlug = moduleSlugById.get(mod.id) ?? '(unset)';
            console.log(`  ${modSlug}`);

            const lessonAssignments = assignSlugs(mod.lessons, 'lesson');
            for (const a of lessonAssignments) {
                if (a.from) {
                    renames.push(
                        `  ${course.space.slug}/${modSlug}/${a.from}  ->  ${course.space.slug}/${modSlug}/${a.to}`
                    );
                }
                if (!DRY_RUN) {
                    await prisma.lesson.update({ where: { id: a.id }, data: { slug: a.to } });
                }
                lessonWrites++;
            }

            if (DRY_RUN) {
                const pending = new Map(lessonAssignments.map(a => [a.id, a.to]));
                for (const l of mod.lessons) {
                    console.log(`    ${pending.get(l.id) ?? l.slug ?? '(unset)'}`);
                }
            }
        }
    }

    console.log(
        `\n${DRY_RUN ? '[dry run] would write' : 'wrote'} ${moduleWrites} module slugs, ${lessonWrites} lesson slugs`
    );

    if (renames.length) {
        console.log(`\n⚠  ${renames.length} slug(s) CHANGED — each is a live URL that now needs a redirect:`);
        renames.forEach(r => console.log(r));
    }

    // Guard: never report success while a row would still break URL resolution.
    // Raw SQL because the column is NOT NULL in the current schema — Prisma's
    // generated types won't accept `slug: null`, but this script must still be
    // able to verify a database that predates that constraint.
    if (!DRY_RUN) {
        const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT (SELECT count(*) FROM "Module" WHERE slug IS NULL)
                 + (SELECT count(*) FROM "Lesson" WHERE slug IS NULL) AS count
        `;
        const nulls = Number(count);
        if (nulls > 0) {
            console.error(`\nFAILED: ${nulls} module/lesson row(s) still have a null slug.`);
            process.exit(1);
        }
        console.log('\nAll modules and lessons have slugs.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
