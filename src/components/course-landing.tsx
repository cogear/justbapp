import Link from 'next/link';
import Image from 'next/image';
import { getCourseLandingData } from '@/app/community/course-actions';
import { courseLandingContent } from '@/lib/course-landing-content';
import { CourseJourney, type JourneyModule } from '@/components/community/course-journey';

export async function CourseLanding({ spaceId, spaceSlug }: { spaceId: string; spaceSlug: string }) {
    const data = await getCourseLandingData(spaceId);
    if (!data) return null;

    const copy = courseLandingContent[spaceSlug];
    const firstModule = data.modules[0];

    const headline = copy?.heroHeadline ?? data.title;
    const subtitle = copy?.heroSubtitle ?? data.description ?? null;
    const ctaLabel = copy?.ctaLabel ?? 'Begin with module one';

    const journeyModules: JourneyModule[] = data.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        order: mod.order,
        lessonCount: mod.lessonCount,
        summary: copy?.moduleOverviews?.[mod.order] ?? mod.firstLessonSummary,
        image: copy?.moduleImages?.[mod.order],
    }));

    return (
        <div className="px-6 pt-24 pb-24">
            {/* ── Hero: why you want this ── */}
            <section className="max-w-4xl mx-auto text-center mb-16">
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-6 animate-in fade-in duration-1000">
                    a free course from b.
                </p>
                <h1 className="font-georgia text-4xl md:text-6xl text-foreground leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {headline}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200"
                       style={{ animationFillMode: 'backwards' }}>
                        {subtitle}
                    </p>
                )}

                {firstModule && (
                    <div className="animate-in fade-in duration-1000 delay-300" style={{ animationFillMode: 'backwards' }}>
                        <Link
                            href={`/community/${spaceSlug}?module=${firstModule.id}`}
                            className="inline-block px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-500"
                        >
                            {ctaLabel}
                        </Link>
                    </div>
                )}
            </section>

            {/* ── The format promise ── */}
            {copy?.formatPromise && (
                <section
                    aria-label="How this course works"
                    className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
                    style={{ animationFillMode: 'backwards' }}
                >
                    {copy.formatPromise.map((promise) => (
                        <div
                            key={promise.title}
                            className="rounded-[2rem] bg-secondary/10 backdrop-blur-md border border-border/40 p-6 md:p-7 text-left"
                        >
                            <h2 className="font-georgia text-lg text-foreground mb-2">{promise.title}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">{promise.body}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* ── Hero image, softened ── */}
            {copy?.heroImage && (
                <div className="relative max-w-4xl mx-auto mb-16 overflow-hidden rounded-[3rem] aspect-[16/7] bg-muted">
                    <Image
                        src={copy.heroImage.src}
                        alt={copy.heroImage.alt}
                        fill
                        className="object-cover brightness-[0.92]"
                        priority
                        sizes="(max-width: 1024px) 100vw, 896px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
                </div>
            )}

            {/* ── Intro prose ── */}
            {copy?.intro && (
                <section className="max-w-2xl mx-auto mb-20">
                    <div className="prose prose-lg dark:prose-invert prose-p:leading-loose prose-p:text-foreground/85 max-w-none">
                        {copy.intro.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </section>
            )}

            {/* ── The journey ── */}
            <div className="text-center mb-10">
                <h2 className="font-georgia text-3xl text-foreground">the path</h2>
                <p className="text-muted-foreground italic font-light mt-2">
                    start anywhere. begin once.
                </p>
            </div>
            <CourseJourney spaceSlug={spaceSlug} modules={journeyModules} />
        </div>
    );
}
