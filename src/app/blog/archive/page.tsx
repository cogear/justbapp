import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ChevronRight, Calendar } from 'lucide-react';

export const metadata: Metadata = {
    title: 'b. | Blog Archive',
    description: 'Explore past insights and reflections.',
};

export default async function BlogArchivePage() {
    // Fetch unique dates and their Global summaries
    const summaries = await prisma.dailySummary.findMany({
        where: { cluster: 'Global' },
        orderBy: { date: 'desc' },
        select: {
            date: true,
            content: true,
        },
    });

    // Grouping by year and month could be nice, but let's start with a beautiful simple list
    // consistent with the "b." aesthetic.

    return (
        <main className="min-h-screen bg-background py-16 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <header className="mb-20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl text-primary font-georgia">b.archive</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        Past reflections on the daily essence.
                    </p>
                </header>

                <div className="w-full space-y-6">
                    {summaries.length > 0 ? (
                        summaries.map((summary, index) => (
                            <Link
                                key={summary.date.toISOString()}
                                href={`/blog?date=${summary.date.toISOString().split('T')[0]}`}
                                className="group block"
                            >
                                <div
                                    className="
                                        w-full p-8 md:p-10 rounded-[2.5rem] 
                                        bg-secondary/10 hover:bg-secondary/20
                                        border border-border/40 hover:border-primary/20
                                        transition-all duration-500 ease-out
                                        hover:-translate-y-1 hover:shadow-xl
                                        flex flex-col md:flex-row md:items-center justify-between gap-6
                                        animate-in fade-in slide-in-from-bottom-8 duration-700
                                    "
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3 text-primary/60">
                                            <Calendar size={16} />
                                            <span className="text-sm font-light tracking-widest uppercase">
                                                {summary.date.toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    timeZone: 'UTC'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2 text-lg leading-relaxed font-light italic">
                                            "{summary.content}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-sm font-medium">Read more</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-40 italic">
                            The archive is still gathering its memories.
                        </div>
                    )}
                </div>

                <div className="mt-32 text-center">
                    <Link
                        href="/blog"
                        className="text-sm text-primary/60 hover:text-primary transition-colors tracking-widest uppercase flex items-center gap-2 justify-center"
                    >
                        Return to b.blog
                    </Link>
                </div>
            </div>
        </main>
    );
}
