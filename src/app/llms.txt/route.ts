import { getAllCoursePaths } from '@/lib/courses/queries';
import { courseLandingContent } from '@/lib/course-landing-content';
import prisma from '@/lib/prisma';
import { BUSINESS } from '@/lib/business';
import { SITE_URL, absoluteUrl } from '@/lib/seo';
import { coursePath, modulePath } from '@/lib/courses/paths';

/**
 * Generated rather than hand-written.
 *
 * The static public/llms.txt this replaces described two courses when the site
 * had six, and would have gone stale again the same way. Built from the same
 * query as the sitemap so the two can't disagree.
 *
 * NOTE: public/llms.txt must stay deleted. A file in public/ shadows an App
 * Router route at the same path, so this would never be reached.
 */
export const revalidate = 86400;

const PRINCIPLES = [
    ['Acceptance, Not Settling', 'Embracing what is without giving up on growth'],
    ['Comfort as Achievement', 'Recognizing rest and ease as valid accomplishments'],
    ['Quality Over Status', 'Choosing depth and meaning over appearances'],
    ['Slow Down Intentionally', 'Making deliberate space in an accelerated world'],
    ['Balance Over Burnout', 'Sustaining energy rather than depleting it'],
    ['Community Not Competition', 'Growing together rather than against each other'],
    ['Gratitude and Small Joys', 'Finding richness in everyday moments'],
];

export async function GET() {
    const paths = await getAllCoursePaths();

    const spaces = await prisma.space.findMany({
        where: { slug: { in: [...new Set(paths.map(p => p.spaceSlug))] } },
        select: { slug: true, name: true, description: true },
        orderBy: { createdAt: 'asc' },
    });

    // Group modules under their course, preserving query order.
    const modulesBySpace = new Map<string, typeof paths>();
    for (const p of paths) {
        const list = modulesBySpace.get(p.spaceSlug) ?? [];
        list.push(p);
        modulesBySpace.set(p.spaceSlug, list);
    }

    const lines: string[] = [
        `# ${BUSINESS.displayName} — ${SITE_URL}`,
        '',
        '## About',
        `${BUSINESS.displayName} is a digital platform and philosophy for intentional living in`,
        'the modern world. Founded by David Crowell, it combines wellness principles with',
        'AI-informed perspectives to help people live more mindfully.',
        '',
        `Operated by ${BUSINESS.legalName}. Contact: ${BUSINESS.email}`,
        '',
        '## Core Philosophy',
        '',
        ...PRINCIPLES.map(([name, gloss], i) => `${i + 1}. ${name} — ${gloss}`),
        '',
        `Read more: ${absoluteUrl('/principles')}`,
        '',
        '## Book',
        '',
        `"The b. Life" by David Crowell — a guide to intentional living through the seven`,
        `core principles. ${absoluteUrl('/book')}`,
        '',
        '## Courses (free, no account required to read)',
        '',
    ];

    let totalLessons = 0;

    for (const space of spaces) {
        const mods = modulesBySpace.get(space.slug) ?? [];
        const lessonCount = mods.reduce((sum, m) => sum + m.lessons.length, 0);
        totalLessons += lessonCount;

        const copy = courseLandingContent[space.slug];
        const blurb = copy?.heroSubtitle ?? space.description ?? '';

        lines.push(`### ${space.name}`);
        if (blurb) lines.push(blurb);
        lines.push(`${mods.length} modules, ${lessonCount} articles — ${absoluteUrl(coursePath(space.slug))}`);
        lines.push('');
        for (const m of mods) {
            lines.push(
                `- ${absoluteUrl(modulePath(space.slug, m.moduleSlug))} (${m.lessons.length} articles)`
            );
        }
        lines.push('');
    }

    lines.push(
        '## Other pages',
        '',
        `- ${absoluteUrl('/')} — home`,
        `- ${absoluteUrl('/community')} — all courses and community spaces`,
        `- ${absoluteUrl('/blog')} — daily essays`,
        `- ${absoluteUrl('/events')} — local events`,
        `- ${absoluteUrl('/subscribe')} — The Daily Anchor newsletter`,
        `- ${absoluteUrl('/about')} — about`,
        `- ${absoluteUrl('/sitemap.xml')} — full URL list`,
        '',
        `Totals: ${spaces.length} courses, ${paths.length} modules, ${totalLessons} articles.`,
        ''
    );

    return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
