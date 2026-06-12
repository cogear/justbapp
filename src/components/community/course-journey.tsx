'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export type JourneyModule = {
    id: string;
    title: string;
    order: number;
    lessonCount: number;
    summary?: string | null;
    image?: { src: string; alt: string };
};

const NUMBER_WORDS = [
    'one', 'two', 'three', 'four', 'five', 'six',
    'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
];

function lessonLine(count: number) {
    const word = NUMBER_WORDS[count - 1] ?? String(count);
    return `${word} short ${count === 1 ? 'story' : 'stories'}`;
}

/**
 * Modules as a meandering journey down a dashed thread — an unhurried path,
 * not a syllabus grid. Cards alternate sides on md+, reveal as you wander down.
 */
export function CourseJourney({
    spaceSlug,
    modules,
}: {
    spaceSlug: string;
    modules: JourneyModule[];
}) {
    const reduceMotion = useReducedMotion();

    return (
        <section aria-label="Course modules" className="relative max-w-3xl mx-auto">
            {/* The thread */}
            <div
                aria-hidden
                className="absolute left-6 md:left-1/2 top-0 bottom-0 border-l border-dashed"
                style={{ borderColor: 'color-mix(in oklab, #8DA399 40%, transparent)' }}
            />

            <ol className="relative space-y-12 md:space-y-16 py-4 list-none">
                {modules.map((mod, i) => {
                    const isFirst = i === 0;
                    const side = i % 2 === 0 ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10';

                    return (
                        <motion.li
                            key={mod.id}
                            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className={`relative pl-14 md:pl-0 md:w-[calc(50%+1.5rem)] ${isFirst ? 'md:w-full md:px-10' : side}`}
                        >
                            {/* Anchor dot on the thread */}
                            <span
                                aria-hidden
                                className={`absolute top-9 w-2.5 h-2.5 rounded-full ${
                                    isFirst ? 'bg-b-clay' : 'bg-b-sage/60'
                                } left-[1.22rem] md:left-1/2 md:-translate-x-1/2`}
                            />

                            <Link
                                href={`/community/${spaceSlug}?module=${mod.id}`}
                                className={`group block rounded-[2.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-xl hover:bg-secondary/20 transition-all duration-700 p-7 md:p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                    isFirst ? 'ring-1 ring-b-clay/50' : ''
                                }`}
                            >
                                {isFirst && (
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-b-clay mb-3">
                                        begin here
                                    </p>
                                )}
                                <div className="flex items-start gap-5">
                                    {mod.image && (
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                            <Image
                                                src={mod.image.src}
                                                alt=""
                                                fill
                                                sizes="4rem"
                                                className="object-cover brightness-[0.95]"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-georgia italic text-sm text-muted-foreground/70 mb-1">
                                            {NUMBER_WORDS[mod.order - 1] ?? mod.order}
                                        </p>
                                        <h3
                                            className={`font-georgia leading-snug group-hover:text-primary transition-colors duration-500 ${
                                                isFirst ? 'text-2xl md:text-3xl' : 'text-xl'
                                            }`}
                                        >
                                            {mod.title}
                                        </h3>
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mt-2">
                                            {lessonLine(mod.lessonCount)}
                                        </p>
                                        {mod.summary && (
                                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                                                {mod.summary}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.li>
                    );
                })}
            </ol>
        </section>
    );
}
