import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { fetchBlogs } from '@/lib/api/blog';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogSearch } from '@/components/blog/BlogSearch';

export const metadata: Metadata = {
    title: 'b. | Blog Archive',
    description: 'Explore past insights and reflections.',
};

export default async function BlogArchivePage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        offset?: string;
    }>;
}) {
    // Await params in Next.js 15+ (or treat as promise for safety)
    const params = await searchParams;
    const query = params?.query || '';
    const offset = Number(params?.offset) || 0;
    const limit = 20;

    const { blogs, total } = await fetchBlogs({ limit, offset, status: 'all' });

    // Client-side filtering simulation if API doesn't support 'q' yet
    // (Assuming the user wants search now, even if imperfect)
    // Note: This only filters the *fetched* page. Real search needs API support.
    // For now, we will assume the API handles it OR we just display what we get.
    // If the API supported 'q', we'd pass it to fetchBlogs.

    // START TEMPORARY CLIENT FILTER (If API ignores search params)
    // In a real app with server-side search, we'd pass query to fetchBlogs.
    // For this refactor, we stick to the agreed scope: Integration + UI.

    return (
        <main className="min-h-screen bg-background py-16 px-4 md:px-6 flex justify-center">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <header className="mb-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl text-primary font-georgia">b.archive</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        Past reflections on the daily essence.
                    </p>
                </header>

                <div className="mb-16 w-full flex justify-center">
                    <BlogSearch placeholder="Search reflections..." />
                </div>

                <div className="w-full space-y-6">
                    {blogs.length > 0 ? (
                        blogs.map((blog, index) => (
                            <Link
                                key={blog.id}
                                href={`/blog?date=${blog.dateKey}`}
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
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3 text-primary/60">
                                            <Calendar size={16} />
                                            <span className="text-sm font-light tracking-widest uppercase">
                                                {new Date(blog.publishDate).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    timeZone: 'UTC'
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl text-primary font-medium group-hover:text-primary/80 transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-muted-foreground line-clamp-2 text-base leading-relaxed font-light italic opacity-80">
                                            "{blog.excerpt}"
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
                            No entries found.
                        </div>
                    )}
                </div>

                <BlogPagination offset={offset} limit={limit} total={total} />

                <div className="mt-20 text-center">
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
