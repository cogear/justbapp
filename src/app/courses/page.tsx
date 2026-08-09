import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { courseLandingContent } from '@/lib/course-landing-content';
import { coursePath, lessonPath } from '@/lib/courses/paths';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { ORG_ID, breadcrumbSchema, courseId, graph } from '@/lib/seo/schema';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
    title: 'Courses',
    description:
        'Free courses from The b. Life — using AI with clarity, and the quieter arts: hands, places, people, and comfort. No account needed to read. Wander in.',
    path: '/courses',
});

/**
 * The two chapters the brand already uses everywhere ("two on using AI with
 * clarity, four on the quieter arts"). A course missing from this set simply
 * lands in the quiet arts — new courses render without a code change.
 */
const MACHINE_COURSES = new Set(['ai-for-humans', 'living-with-ai']);

interface CourseRow {
    name: string;
    slug: string;
    image: string;
    /** The course's own invitation line, spoken through the door. */
    headline: string;
    subtitle: string;
    moduleCount: number;
    lessonCount: number;
    firstLesson: { title: string; href: string } | null;
}

async function getCourseRows(): Promise<CourseRow[]> {
    const spaces = await prisma.space.findMany({
        where: {
            type: 'COURSE',
            accessLevel: 'OPEN',
            courses: { some: { modules: { some: { lessons: { some: {} } } } } },
        },
        select: {
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            courses: {
                select: {
                    modules: {
                        where: { lessons: { some: {} } },
                        orderBy: { order: 'asc' },
                        select: {
                            slug: true,
                            _count: { select: { lessons: true } },
                            lessons: {
                                orderBy: { order: 'asc' },
                                take: 1,
                                select: { title: true, slug: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return spaces.map(space => {
        const copy = courseLandingContent[space.slug];
        const modules = space.courses.flatMap(c => c.modules);
        const first = modules[0]?.lessons[0];

        return {
            name: space.name,
            slug: space.slug,
            image: space.imageUrl || `/images/community/cards/${space.slug}.png`,
            headline: copy?.heroHeadline ?? space.name,
            subtitle: copy?.heroSubtitle ?? space.description ?? '',
            moduleCount: modules.length,
            lessonCount: modules.reduce((sum, m) => sum + m._count.lessons, 0),
            firstLesson: first
                ? {
                      title: first.title,
                      href: lessonPath(space.slug, modules[0].slug, first.slug),
                  }
                : null,
        };
    });
}

/** One course: an arched doorway beside its invitation. */
function CourseDoor({ course, index }: { course: CourseRow; index: number }) {
    const imageLeft = index % 2 === 0;

    return (
        <article
            className="group grid md:grid-cols-12 items-center gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 motion-reduce:animate-none"
            style={{ animationDelay: `${Math.min(index, 5) * 120}ms`, animationFillMode: 'backwards' }}
        >
            {/* The doorway. Frame notices you before you touch the knob. */}
            <Link
                href={coursePath(course.slug)}
                tabIndex={-1}
                aria-hidden="true"
                className={`block w-full max-w-[15rem] mx-auto md:max-w-none md:col-span-4 ${
                    imageLeft ? 'md:order-1' : 'md:order-2 md:col-start-9'
                }`}
            >
                <div className="rounded-t-full rounded-b-[1.75rem] border border-foreground/15 group-hover:border-b-sage/70 p-2 transition-colors duration-700">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.25rem] bg-muted">
                        <Image
                            src={course.image}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 15rem, 24rem"
                            className="object-cover brightness-[0.96] transition-transform duration-1000 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                    </div>
                </div>
            </Link>

            <div
                className={`md:col-span-7 text-center md:text-left ${
                    imageLeft ? 'md:order-2 md:col-start-6' : 'md:order-1 md:col-start-1'
                }`}
            >
                {/* Door plaque: the name and the honest size of what's inside.
                    The name is the only place the course title appears, so it
                    carries more ink than the counts. */}
                <p className="text-[11px] uppercase tracking-[0.25em] mb-3">
                    <span className="text-foreground/80 font-semibold">{course.name}</span>
                    <span className="text-muted-foreground">
                        {' '}· {course.moduleCount} modules · {course.lessonCount} lessons
                    </span>
                </p>

                <h2 className="font-georgia text-3xl md:text-4xl leading-snug text-foreground mb-4">
                    <Link
                        href={coursePath(course.slug)}
                        className="hover:text-primary transition-colors duration-500"
                    >
                        {course.headline}
                    </Link>
                </h2>

                {course.subtitle && (
                    <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-prose mx-auto md:mx-0 mb-5">
                        {course.subtitle}
                    </p>
                )}

                <p className="flex flex-wrap items-baseline justify-center md:justify-start gap-x-3 gap-y-1 text-sm">
                    <Link
                        href={coursePath(course.slug)}
                        className="text-[#5F7D72] dark:text-b-sage font-medium underline decoration-transparent hover:decoration-current underline-offset-4 transition-[text-decoration-color] duration-500"
                    >
                        wander in <span aria-hidden>→</span>
                    </Link>
                    {course.firstLesson && (
                        <span className="text-muted-foreground">
                            begins with{' '}
                            <Link
                                href={course.firstLesson.href}
                                className="font-georgia italic text-foreground/80 hover:text-primary transition-colors"
                            >
                                &ldquo;{course.firstLesson.title}&rdquo;
                            </Link>
                        </span>
                    )}
                </p>
            </div>
        </article>
    );
}

function ChapterRule({ label, gloss }: { label: string; gloss: string }) {
    return (
        <div className="flex items-center gap-5" role="presentation">
            <span className="h-px flex-1 bg-border/60" />
            <p className="text-center">
                <span className="font-georgia italic text-xl text-foreground">{label}</span>
                <span className="block text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1.5">
                    {gloss}
                </span>
            </p>
            <span className="h-px flex-1 bg-border/60" />
        </div>
    );
}

export default async function CoursesPage() {
    const rows = await getCourseRows();

    const machines = rows.filter(r => MACHINE_COURSES.has(r.slug));
    const quietArts = rows.filter(r => !MACHINE_COURSES.has(r.slug));

    const totalModules = rows.reduce((sum, r) => sum + r.moduleCount, 0);
    const totalLessons = rows.reduce((sum, r) => sum + r.lessonCount, 0);

    const schema = graph(
        breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Courses' },
        ]),
        {
            '@type': 'ItemList',
            name: 'Courses',
            description:
                'Free courses on AI literacy and intentional living — hands-on calm, third places, gathering, and comfort',
            itemListElement: rows.map((course, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'Course',
                    '@id': courseId(course.slug),
                    name: course.name,
                    url: absoluteUrl(coursePath(course.slug)),
                    description: course.subtitle || undefined,
                    provider: { '@id': ORG_ID },
                },
            })),
        }
    );

    return (
        <main className="px-6 pt-20 pb-28 md:pt-24">
            <JsonLd data={schema} />

            {/* ── Hero ── */}
            <header className="text-center max-w-2xl mx-auto mb-16 md:mb-20 animate-in fade-in duration-1000 motion-reduce:animate-none">
                <h1 className="font-georgia text-5xl md:text-6xl text-foreground mb-5">the courses</h1>
                <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                    Every door on this page is open. No account to read, no deadlines, no one
                    keeping score — find the room that sounds like your life and wander in.
                </p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    {rows.length} courses · {totalModules} modules · {totalLessons} lessons · all free
                </p>
            </header>

            <div className="max-w-5xl mx-auto space-y-16 md:space-y-24">
                {machines.length > 0 && (
                    <>
                        <ChapterRule
                            label="living with machines"
                            gloss="using AI with clarity and good judgment"
                        />
                        {machines.map((course, i) => (
                            <CourseDoor key={course.slug} course={course} index={i} />
                        ))}
                    </>
                )}

                {quietArts.length > 0 && (
                    <>
                        <ChapterRule
                            label="the quiet arts"
                            gloss="hands · places · people · comfort"
                        />
                        {quietArts.map((course, i) => (
                            <CourseDoor
                                key={course.slug}
                                course={course}
                                index={machines.length + i}
                            />
                        ))}
                    </>
                )}
            </div>

            <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] italic mt-20 md:mt-28">
                take the one that takes you
            </p>
        </main>
    );
}
