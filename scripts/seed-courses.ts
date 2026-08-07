import { PrismaClient } from '@prisma/client';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

const COURSES = [
    {
        folderName: 'ai-for-humans',
        spaceName: 'AI for Humans',
        spaceSlug: 'ai-for-humans',
        description: 'A human-centered guide to understanding and working with AI',
    },
    {
        folderName: 'living-with-ai',
        spaceName: 'Living with AI',
        spaceSlug: 'living-with-ai',
        description: 'Intentional living in an AI-forward world',
    },
    {
        folderName: 'the-quiet-crafts',
        spaceName: 'The Quiet Crafts',
        spaceSlug: 'the-quiet-crafts',
        description: 'Hands-on calming practice — repetition, patience, and the particular quiet of work your body knows how to do',
        moduleTitles: {
            '01-pilot-episodes': 'Pilot Episodes',
            '02-why-making-calms-us': 'Why Making Calms Us',
            '03-knitting': 'Knitting',
            '04-crochet': 'Crochet',
            '05-needle-and-thread': 'Needle and Thread',
            '06-working-with-paper': 'Working With Paper',
            '07-growing-things': 'Growing Things',
            '08-the-kitchen-as-practice': 'The Kitchen as Practice',
            '09-repair-and-restore': 'Repair and Restore',
            '10-doing-it-badly-on-purpose': 'Doing It Badly, On Purpose',
        },
    },
    {
        folderName: 'third-places',
        spaceName: 'Third Places',
        spaceSlug: 'third-places',
        description: "Oldenburg's unhosted rooms — neutral ground, no invitation, nothing owed. Somewhere to just be a regular",
        moduleTitles: {
            '01-pilot-episodes': 'Pilot Episodes',
            '02-oldenburg-s-eight': "Oldenburg's Eight",
            '03-why-they-disappeared': 'Why They Disappeared',
            '04-caf-s-counters-and-bars': 'Cafés, Counters and Bars',
            '05-libraries-and-public-rooms': 'Libraries and Public Rooms',
            '06-outdoors-and-open-ground': 'Outdoors and Open Ground',
            '07-places-built-around-doing': 'Places Built Around Doing',
            '08-becoming-a-regular': 'Becoming a Regular',
            '09-when-there-aren-t-any': "When There Aren't Any",
            '10-the-online-question': 'The Online Question',
        },
    },
    {
        folderName: 'private-invite-meetups',
        spaceName: 'Private Invite Meetups',
        spaceSlug: 'private-invite-meetups',
        description: 'The gatherings that only happen if someone makes them — hosting, inviting, and the obligation that makes it work',
        moduleTitles: {
            '01-pilot-episodes': 'Pilot Episodes',
            '02-why-host-at-all': 'Why Host at All',
            '03-the-invitation': 'The Invitation',
            '04-dinner-parties': 'Dinner Parties',
            '05-walks-and-the-outdoors': 'Walks and the Outdoors',
            '06-games-and-sport': 'Games and Sport',
            '07-small-and-low-effort': 'Small and Low Effort',
            '08-hosting-skills': 'Hosting Skills',
            '09-reciprocity-without-scorekeeping': 'Reciprocity Without Scorekeeping',
            '10-when-it-goes-wrong': 'When It Goes Wrong',
        },
    },
    {
        folderName: 'the-comfortable-life',
        spaceName: 'The Comfortable Life',
        spaceSlug: 'the-comfortable-life',
        description: 'Hygge and its cousins — how cultures around the world build comfort, and how to build yours',
        moduleTitles: {
            '01-pilot-episodes': 'Pilot Episodes',
            '02-hygge-denmark': 'Hygge — Denmark',
            '03-koselig-norway': 'Koselig — Norway',
            '04-gezelligheid-the-netherlands': 'Gezelligheid — The Netherlands',
            '05-gem-tlichkeit-germany-austria': 'Gemütlichkeit — Germany & Austria',
            '06-wabi-sabi-and-the-japanese-room': 'Wabi-Sabi and the Japanese Room',
            '07-the-wider-map': 'The Wider Map',
            '08-building-your-own': 'Building Your Own',
            '09-comfort-in-a-hard-climate': 'Comfort in a Hard Climate',
            '10-defending-your-comfort': 'Defending Your Comfort',
        },
    },
];

function folderToTitle(folderName: string): string {
    // "01-foundation-stories" → "Foundation Stories"
    return folderName
        .replace(/^\d+-/, '')
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function extractTitle(markdown: string): string {
    const match = markdown.match(/^#\s+(.+)/m);
    return match ? match[1].trim() : 'Untitled';
}

function extractLessonOrder(filename: string): number {
    // Try "01-something.md" or "episode-01-something.md" patterns
    const match = filename.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

async function seedCourse(courseDef: typeof COURSES[number]) {
    const rootDir = join(process.cwd(), courseDef.folderName);

    // Create or update Space
    const space = await prisma.space.upsert({
        where: { slug: courseDef.spaceSlug },
        update: { name: courseDef.spaceName, description: courseDef.description },
        create: {
            name: courseDef.spaceName,
            slug: courseDef.spaceSlug,
            description: courseDef.description,
            type: 'COURSE',
        },
    });
    console.log(`Space: ${space.name} (${space.id})`);

    // Find or create Course
    let course = await prisma.course.findFirst({ where: { spaceId: space.id } });
    if (!course) {
        course = await prisma.course.create({
            data: {
                spaceId: space.id,
                title: courseDef.spaceName,
                description: courseDef.description,
            },
        });
    }
    console.log(`Course: ${course.title} (${course.id})`);

    // Read subfolders
    const entries = await readdir(rootDir, { withFileTypes: true });
    const subfolders = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .sort((a, b) => a.name.localeCompare(b.name));

    let totalLessons = 0;

    for (let i = 0; i < subfolders.length; i++) {
        const folder = subfolders[i];
        const moduleOrder = i + 1;
        const moduleTitle = (courseDef as { moduleTitles?: Record<string, string> }).moduleTitles?.[folder.name] ?? folderToTitle(folder.name);

        // Find or create Module
        let mod = await prisma.module.findFirst({
            where: { courseId: course.id, title: moduleTitle },
        });
        if (!mod) {
            mod = await prisma.module.create({
                data: {
                    courseId: course.id,
                    title: moduleTitle,
                    order: moduleOrder,
                },
            });
        } else {
            await prisma.module.update({
                where: { id: mod.id },
                data: { order: moduleOrder },
            });
        }
        console.log(`  Module ${moduleOrder}: ${moduleTitle}`);

        // Read markdown files in this subfolder
        const folderPath = join(rootDir, folder.name);
        const files = (await readdir(folderPath))
            .filter(f => f.endsWith('.md'))
            .sort((a, b) => extractLessonOrder(a) - extractLessonOrder(b) || a.localeCompare(b));

        for (let j = 0; j < files.length; j++) {
            const file = files[j];
            const filePath = join(folderPath, file);
            const content = await readFile(filePath, 'utf-8');
            const title = extractTitle(content);
            const lessonOrder = j + 1;

            // Find or create Lesson. videoUrl is owned by the admin UI, so we
            // leave it alone here — never touch it on update, default to null on create.
            const existing = await prisma.lesson.findFirst({
                where: { moduleId: mod.id, title },
            });
            if (!existing) {
                await prisma.lesson.create({
                    data: {
                        moduleId: mod.id,
                        title,
                        content,
                        order: lessonOrder,
                    },
                });
            } else {
                await prisma.lesson.update({
                    where: { id: existing.id },
                    data: { content, order: lessonOrder },
                });
            }
            totalLessons++;
        }
    }

    console.log(`  Total lessons: ${totalLessons}`);
}

async function main() {
    // Optional: --course <folderName> (repeatable) seeds only the named courses.
    const args = process.argv.slice(2);
    const wanted: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--course' && args[i + 1]) wanted.push(args[++i]);
    }
    const toSeed = wanted.length
        ? COURSES.filter(c => wanted.includes(c.folderName))
        : COURSES;
    if (wanted.length && toSeed.length !== wanted.length) {
        const known = new Set(COURSES.map(c => c.folderName));
        console.error('Unknown course(s):', wanted.filter(w => !known.has(w)).join(', '));
        process.exit(1);
    }
    for (const courseDef of toSeed) {
        await seedCourse(courseDef);
        console.log('---');
    }
    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
