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

async function seedCourse(courseDef: typeof COURSES[0]) {
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
        const moduleTitle = folderToTitle(folder.name);

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
    for (const courseDef of COURSES) {
        await seedCourse(courseDef);
        console.log('---');
    }
    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
