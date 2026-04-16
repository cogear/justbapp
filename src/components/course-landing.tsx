import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { getCourseLandingData } from '@/app/community/course-actions';
import { courseLandingContent } from '@/lib/course-landing-content';

export async function CourseLanding({ spaceId, spaceSlug }: { spaceId: string; spaceSlug: string }) {
    const data = await getCourseLandingData(spaceId);
    if (!data) return null;

    const copy = courseLandingContent[spaceSlug];

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <section className="mb-10 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-georgia font-bold tracking-tight mb-4">
                    {data.title}
                </h1>
                {copy?.heroSubtitle ? (
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {copy.heroSubtitle}
                    </p>
                ) : data.description ? (
                    <p className="text-lg leading-relaxed text-foreground/80">
                        {data.description}
                    </p>
                ) : null}
            </section>

            {copy?.heroImage && (
                <div className="relative mb-12 overflow-hidden rounded-2xl aspect-[16/7] bg-muted">
                    <Image
                        src={copy.heroImage.src}
                        alt={copy.heroImage.alt}
                        fill
                        className="object-cover brightness-[0.92]"
                        priority
                        sizes="(max-width: 1024px) 100vw, 960px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
                </div>
            )}

            {copy?.intro && (
                <section className="mb-16 max-w-3xl">
                    <div className="prose prose-lg dark:prose-invert prose-p:leading-relaxed prose-p:text-foreground/85 max-w-none">
                        {copy.intro.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-georgia font-bold mb-6">Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.modules.map(mod => {
                        const summary = copy?.moduleOverviews?.[mod.order] ?? mod.firstLessonSummary;
                        return (
                            <Link
                                key={mod.id}
                                href={`/community/${spaceSlug}?module=${mod.id}`}
                                className="group block p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                                    <span>{String(mod.order).padStart(2, '0')}</span>
                                    <span className="opacity-60">•</span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={12} />
                                        {mod.lessonCount} {mod.lessonCount === 1 ? 'article' : 'articles'}
                                    </span>
                                </div>
                                <h3 className="font-georgia text-lg font-medium leading-snug group-hover:text-primary transition-colors">
                                    {mod.title}
                                </h3>
                                {summary && (
                                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                                        {summary}
                                    </p>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
