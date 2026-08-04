/**
 * Set a lesson's video URL from the command line.
 *
 * The URL is validated against the same rules the player uses, so you can't save
 * something that would silently render nothing.
 *
 *   # what's still missing a video
 *   npm run set-lesson-video -- --list-missing
 *
 *   # find a lesson (substring match on title, case-insensitive)
 *   npm run set-lesson-video -- --find "welcome"
 *
 *   # one lesson, by id or unique title substring
 *   npm run set-lesson-video -- --lesson "Welcome" --url https://youtu.be/vmVwNaE2Hfc --apply
 *
 *   # many at once, from JSON: [{ "lesson": "<id or title>", "url": "..." }, ...]
 *   npm run set-lesson-video -- --file videos.json --apply
 *
 *   # clear a video
 *   npm run set-lesson-video -- --lesson "Welcome" --url "" --apply
 *
 * Without --apply it is a dry run. NOTE: .env points at the live Neon database.
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { isPlayableVideoUrl } from '../src/lib/video-url';

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 ? process.argv[i + 1] : undefined;
}
const has = (name: string) => process.argv.includes(`--${name}`);
const APPLY = has('apply');

type LessonRow = {
    id: string;
    title: string;
    order: number;
    videoUrl: string | null;
    module: { title: string; course: { title: string } };
};

const label = (l: LessonRow) => `${l.module.course.title} / ${l.module.title} / ${l.order}. ${l.title}`;

const SELECT = {
    id: true,
    title: true,
    order: true,
    videoUrl: true,
    module: { select: { title: true, course: { select: { title: true } } } },
} as const;

/** Resolve by exact id first, then by case-insensitive title substring. */
async function resolveLesson(needle: string): Promise<LessonRow> {
    const byId = await prisma.lesson.findUnique({ where: { id: needle }, select: SELECT });
    if (byId) return byId;

    const matches = await prisma.lesson.findMany({
        where: { title: { contains: needle, mode: 'insensitive' } },
        select: SELECT,
        orderBy: { title: 'asc' },
    });

    if (matches.length === 0) throw new Error(`No lesson matches "${needle}"`);
    if (matches.length > 1) {
        const list = matches.slice(0, 10).map(m => `    ${label(m)}\n      id: ${m.id}`).join('\n');
        throw new Error(
            `"${needle}" matches ${matches.length} lessons — narrow it or pass an id:\n${list}` +
            (matches.length > 10 ? `\n    …and ${matches.length - 10} more` : '')
        );
    }
    return matches[0];
}

async function setOne(needle: string, rawUrl: string) {
    const lesson = await resolveLesson(needle);
    const url = rawUrl.trim();

    if (url !== '' && !isPlayableVideoUrl(url)) {
        throw new Error(
            `Not a playable URL: "${url}"\n` +
            `  Expected a YouTube link/id, or an https link ending in .mp4/.m4v/.webm/.mov\n` +
            `  The player renders nothing for anything else, so this would look like a broken lesson.`
        );
    }

    const next = url === '' ? null : url;
    if (lesson.videoUrl === next) {
        console.log(`  unchanged  ${label(lesson)}`);
        return;
    }

    console.log(`  ${APPLY ? 'set       ' : 'would set '} ${label(lesson)}`);
    console.log(`               ${lesson.videoUrl ?? '(none)'} → ${next ?? '(none)'}`);

    if (APPLY) {
        await prisma.lesson.update({ where: { id: lesson.id }, data: { videoUrl: next } });
    }
}

async function main() {
    if (has('list-missing')) {
        const missing = await prisma.lesson.findMany({
            where: { videoUrl: null },
            select: SELECT,
            orderBy: [{ moduleId: 'asc' }, { order: 'asc' }],
        });
        missing.forEach(m => console.log(`  ${label(m)}\n    id: ${m.id}`));
        console.log(`\n${missing.length} lesson(s) without a video.`);
        return;
    }

    const find = arg('find');
    if (find) {
        const matches = await prisma.lesson.findMany({
            where: { title: { contains: find, mode: 'insensitive' } },
            select: SELECT,
            orderBy: { title: 'asc' },
        });
        matches.forEach(m => console.log(`  ${label(m)}\n    id: ${m.id}\n    video: ${m.videoUrl ?? '(none)'}`));
        console.log(`\n${matches.length} match(es).`);
        return;
    }

    const file = arg('file');
    if (file) {
        const parsed = JSON.parse(readFileSync(file, 'utf8')) as Array<{ lesson: string; url: string }>;
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of { lesson, url }');
        // Validate every row before writing any, so a typo in row 40 doesn't
        // leave rows 1-39 applied and the rest not.
        for (const [i, row] of parsed.entries()) {
            if (!row || typeof row.lesson !== 'string' || typeof row.url !== 'string') {
                throw new Error(`Row ${i}: expected { lesson: string, url: string }`);
            }
            if (row.url.trim() !== '' && !isPlayableVideoUrl(row.url)) {
                throw new Error(`Row ${i} ("${row.lesson}"): not a playable URL: "${row.url}"`);
            }
        }
        for (const row of parsed) await setOne(row.lesson, row.url);
        console.log(`\n${APPLY ? 'Applied' : 'Would apply'} ${parsed.length} row(s).`);
        if (!APPLY) console.log('Dry run. Re-run with --apply to write.');
        return;
    }

    const lesson = arg('lesson');
    const url = arg('url');
    if (lesson === undefined || url === undefined) {
        console.log('Usage:');
        console.log('  --list-missing                       lessons with no video');
        console.log('  --find <text>                        search lessons by title');
        console.log('  --lesson <id|title> --url <url>      set one (--url "" clears)');
        console.log('  --file <path.json>                   bulk: [{ "lesson": "...", "url": "..." }]');
        console.log('  --apply                              write (default is a dry run)');
        process.exitCode = 1;
        return;
    }

    await setOne(lesson, url);
    if (!APPLY) console.log('\nDry run. Re-run with --apply to write.');
}

main()
    .catch(err => {
        console.error(`\n${err instanceof Error ? err.message : err}`);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
