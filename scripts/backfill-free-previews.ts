/**
 * Opens the first lesson of every module to signed-out visitors.
 *
 * The invariant is "every module has at least one open lesson" — NOT "lesson 1 is
 * always open". That makes the script idempotent: once you've hand-picked a
 * different lesson in /admin/courses, re-running this leaves your choice alone
 * instead of silently re-opening lesson 1.
 *
 *   npm run backfill:free-previews            # dry run — prints what it would do
 *   npm run backfill:free-previews -- --apply # writes
 *
 * NOTE: .env points at the live Neon database. This writes production data.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
    const modules = await prisma.module.findMany({
        orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
        select: {
            id: true,
            title: true,
            order: true,
            course: { select: { title: true } },
            lessons: {
                // createdAt breaks ties in case two lessons ever share an `order`.
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
                select: { id: true, title: true, order: true, freePreview: true },
            },
        },
    });

    let opened = 0;
    let skipped = 0;
    let empty = 0;

    for (const mod of modules) {
        const label = `${mod.course.title} / ${mod.order}. ${mod.title}`;

        if (mod.lessons.length === 0) {
            empty++;
            console.log(`  empty   ${label}`);
            continue;
        }

        const alreadyOpen = mod.lessons.filter(l => l.freePreview);
        if (alreadyOpen.length > 0) {
            skipped++;
            console.log(`  skip    ${label} — already open: ${alreadyOpen.map(l => l.title).join(', ')}`);
            continue;
        }

        const first = mod.lessons[0];
        console.log(`  ${APPLY ? 'open   ' : 'would  '} ${label} → ${first.order}. ${first.title}`);
        if (APPLY) {
            await prisma.lesson.update({
                where: { id: first.id },
                data: { freePreview: true },
            });
        }
        opened++;
    }

    console.log(
        `\n${APPLY ? 'Opened' : 'Would open'} ${opened} lesson(s). ` +
        `Skipped ${skipped} module(s) already satisfying the invariant. ${empty} empty module(s).`
    );
    if (!APPLY) console.log('Dry run. Re-run with --apply to write.');
}

main()
    .catch(err => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
