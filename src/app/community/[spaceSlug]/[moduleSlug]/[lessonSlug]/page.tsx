import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { getLessonBySlug } from '@/lib/courses/queries';
import { lessonPath } from '@/lib/courses/paths';
import { extractSummary } from '@/lib/extract-summary';
import { buildMetadata, toDescription } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, graph, lessonSchema } from '@/lib/seo/schema';
import { LessonFooter, LessonVideo } from '@/components/community/lesson-engagement';

/**
 * The prose is rendered here, on the server, on purpose: this is the content
 * the site is trying to rank, and it previously reached the browser only after
 * a client-side round trip — so crawlers saw an empty shell. Viewer-specific UI
 * lives in LessonVideo / LessonFooter so this file never touches
 * `getUser()`/`cookies()`/`headers()`.
 *
 * `revalidate` is currently inert and there is deliberately no
 * `generateStaticParams` — see the note in ../page.tsx for why.
 */
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ spaceSlug: string; moduleSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { spaceSlug, moduleSlug, lessonSlug } = await params;
    const lesson = await getLessonBySlug(spaceSlug, moduleSlug, lessonSlug);
    if (!lesson) return {};

    const space = lesson.module.course.space;

    return buildMetadata({
        title: lesson.title,
        description: toDescription(
            extractSummary(lesson.content),
            `${lesson.title} — part of ${lesson.module.title} in ${space.name}.`
        ),
        path: lessonPath(spaceSlug, moduleSlug, lessonSlug),
        type: 'article',
        publishedTime: lesson.createdAt,
        modifiedTime: lesson.updatedAt,
        section: lesson.module.title,
        image: { url: space.imageUrl || `/images/community/cards/${spaceSlug}.png` },
    });
}

export default async function LessonPage({ params }: PageProps) {
    const { spaceSlug, moduleSlug, lessonSlug } = await params;
    const lesson = await getLessonBySlug(spaceSlug, moduleSlug, lessonSlug);
    if (!lesson) notFound();

    const mod = lesson.module;
    const space = mod.course.space;

    const siblings = mod.lessons;
    const index = siblings.findIndex(l => l.id === lesson.id);
    const prev = index > 0 ? siblings[index - 1] : null;
    const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

    const description = toDescription(
        extractSummary(lesson.content),
        `${lesson.title} — part of ${mod.title} in ${space.name}.`
    );

    const schema = graph(
        breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Community', path: '/community' },
            { name: space.name, path: `/community/${spaceSlug}` },
            { name: mod.title, path: `/community/${spaceSlug}/${moduleSlug}` },
            { name: lesson.title },
        ]),
        lessonSchema({
            spaceSlug,
            moduleSlug,
            slug: lessonSlug,
            title: lesson.title,
            description,
            moduleTitle: mod.title,
            wordCount: (lesson.content ?? '').split(/\s+/).filter(Boolean).length,
            datePublished: lesson.createdAt,
            dateModified: lesson.updatedAt,
            image: space.imageUrl || `/images/community/cards/${spaceSlug}.png`,
        })
    );

    return (
        <div className="max-w-2xl mx-auto px-6 pt-24 pb-20 animate-in fade-in duration-700">
            <JsonLd data={schema} />

            <LessonVideo lessonId={lesson.id} lessonTitle={lesson.title} />

            <article className="prose prose-lg dark:prose-invert prose-headings:font-georgia prose-headings:tracking-tight prose-p:leading-loose prose-p:text-foreground/85 prose-li:text-foreground/85 prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-em:text-foreground/70 max-w-none">
                <ReactMarkdown>{lesson.content ?? ''}</ReactMarkdown>
            </article>

            {(prev || next) && (
                <nav aria-label="Lesson navigation" className="mt-8 flex flex-col sm:flex-row gap-3">
                    {prev && (
                        <Link
                            href={lessonPath(spaceSlug, moduleSlug, prev.slug)}
                            className="group flex-1 rounded-[1.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                        >
                            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                                <ArrowLeft size={12} /> previous story
                            </span>
                            <span className="text-sm font-georgia text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {prev.title}
                            </span>
                        </Link>
                    )}
                    {next && (
                        <Link
                            href={lessonPath(spaceSlug, moduleSlug, next.slug)}
                            className="group flex-1 rounded-[1.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-5 text-right hover:bg-secondary/20 hover:shadow-md transition-all duration-500"
                        >
                            <span className="flex items-center justify-end gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                                next story <ArrowRight size={12} />
                            </span>
                            <span className="text-sm font-georgia text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {next.title}
                            </span>
                        </Link>
                    )}
                </nav>
            )}

            <LessonFooter lessonId={lesson.id} />
        </div>
    );
}
