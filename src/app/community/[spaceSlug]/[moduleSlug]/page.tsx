import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { getModuleBySlug } from '@/lib/courses/queries';
import { lessonPath, modulePath } from '@/lib/courses/paths';
import { courseLandingContent } from '@/lib/course-landing-content';
import { extractSummary } from '@/lib/extract-summary';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph, moduleSchema } from '@/lib/seo/schema';
import { absoluteUrl } from '@/lib/seo';

/**
 * Nothing in this file may call `stackServerApp.getUser()`, `cookies()`, or
 * `headers()` — any one of them opts the route into dynamic rendering.
 * Viewer-specific UI belongs in a client island.
 *
 * `revalidate` is currently inert: `StackProvider` in the root layout awaits
 * `cookies()` (its tokenStore is "nextjs-cookie"), which makes every route in
 * the app dynamic — only /robots.txt, /sitemap.xml and /icon.png prerender.
 * The export stays because it costs nothing and this route becomes cacheable
 * the moment that changes.
 *
 * Deliberately NO `generateStaticParams`: while the app is dynamic, its output
 * is discarded, and prerendering ~600 database-backed pages across 11 build
 * workers exhausts Neon's connection pool and fails the build.
 */
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ spaceSlug: string; moduleSlug: string }>;
}

/** The module's own blurb, falling back to the first lesson's summary. */
function moduleDescription(
    spaceSlug: string,
    order: number,
    firstLessonContent: string | null
): string {
    return (
        courseLandingContent[spaceSlug]?.moduleOverviews?.[order] ??
        extractSummary(firstLessonContent) ??
        ''
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { spaceSlug, moduleSlug } = await params;
    const mod = await getModuleBySlug(spaceSlug, moduleSlug);
    if (!mod) return {};

    const space = mod.course.space;
    const image = courseLandingContent[spaceSlug]?.moduleImages?.[mod.order];

    return buildMetadata({
        title: `${mod.title} — ${space.name}`,
        description: moduleDescription(spaceSlug, mod.order, mod.lessons[0]?.content ?? null),
        path: modulePath(spaceSlug, moduleSlug),
        image: image
            ? { url: image.src, alt: image.alt }
            : { url: space.imageUrl || `/images/community/cards/${spaceSlug}.png` },
    });
}

export default async function ModulePage({ params }: PageProps) {
    const { spaceSlug, moduleSlug } = await params;
    const mod = await getModuleBySlug(spaceSlug, moduleSlug);
    if (!mod) notFound();

    const space = mod.course.space;
    const courseCopy = courseLandingContent[spaceSlug];
    const summary = moduleDescription(spaceSlug, mod.order, mod.lessons[0]?.content ?? null);
    const moduleImage = courseCopy?.moduleImages?.[mod.order];
    const lessonLabel = mod.lessons.length === 1 ? 'article' : 'articles';

    const schema = graph(
        breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Community', path: '/community' },
            { name: space.name, path: `/community/${spaceSlug}` },
            { name: mod.title },
        ]),
        moduleSchema(
            {
                spaceSlug,
                slug: mod.slug,
                title: mod.title,
                description: summary,
                lessonCount: mod.lessons.length,
            },
            spaceSlug
        ),
        {
            '@type': 'ItemList',
            name: mod.title,
            numberOfItems: mod.lessons.length,
            itemListElement: mod.lessons.map((lesson, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: lesson.title,
                url: absoluteUrl(lessonPath(spaceSlug, mod.slug, lesson.slug)),
            })),
        }
    );

    return (
        <div className="max-w-2xl mx-auto px-6 pt-24 pb-20 animate-in fade-in duration-700">
            <JsonLd data={schema} />

            <header className="text-center mb-10">
                <p className="font-georgia italic text-sm text-muted-foreground/70 mb-2">
                    module {mod.order}
                </p>
                <h1 className="text-3xl md:text-4xl font-georgia text-foreground mb-4">{mod.title}</h1>
                {summary && (
                    <p className="text-base leading-relaxed text-muted-foreground max-w-xl mx-auto mb-3">
                        {summary}
                    </p>
                )}
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    {mod.lessons.length} {lessonLabel}
                </p>
            </header>

            {moduleImage && (
                <div className="relative mb-12 overflow-hidden rounded-[2.5rem] aspect-[16/6] bg-muted">
                    <Image
                        src={moduleImage.src}
                        alt={moduleImage.alt}
                        fill
                        className="object-cover brightness-[0.92]"
                        sizes="(max-width: 896px) 100vw, 896px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
                </div>
            )}

            <ol className="space-y-3 list-none">
                {mod.lessons.map((lesson, i) => {
                    const lessonSummary = extractSummary(lesson.content);
                    return (
                        <li key={lesson.id}>
                            <Link
                                href={lessonPath(spaceSlug, mod.slug, lesson.slug)}
                                className="group flex items-start gap-4 rounded-[1.75rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 md:p-6 hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                            >
                                <span className="font-georgia italic text-sm text-muted-foreground/50 mt-0.5 w-6 text-right shrink-0">
                                    {i + 1}
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-georgia text-base leading-snug text-foreground group-hover:text-primary transition-colors">
                                        {lesson.title}
                                    </h2>
                                    {lessonSummary && (
                                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                            {lessonSummary}
                                        </p>
                                    )}
                                </div>
                                <FileText
                                    size={16}
                                    className="text-muted-foreground/40 ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors"
                                />
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
