import React from 'react';
import { Metadata } from 'next';
import { format } from 'date-fns';
import * as cheerio from 'cheerio';

export const metadata: Metadata = {
    title: 'b. | Blog',
    description: 'Insights and guidance for the modern world.',
};

async function getBlogContent(date: Date) {
    const year = format(date, 'yyyy');
    const month = format(date, 'MM');
    const day = format(date, 'dd');

    const url = `https://justbblog.s3.amazonaws.com/blog/${year}/${month}/${day}/index.html`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) return null;

        const rawHtml = await response.text();
        const $ = cheerio.load(rawHtml);

        // Extract the main article content (most of the styling is here)
        const content = $('article.container').html();
        if (!content) return null;

        // Extract and refine styles
        let styles = $('style').html() || '';

        // Transform hardcoded colors to CSS variables for theme support
        // We'll replace the blog's internal variables with our app's variables
        styles = styles.replace(/--background-color:\s*[^;]+;/g, '--background-color: transparent;');
        styles = styles.replace(/--text-color:\s*[^;]+;/g, '--text-color: var(--foreground);');
        styles = styles.replace(/--subtext-color:\s*[^;]+;/g, '--subtext-color: var(--muted-foreground);');
        styles = styles.replace(/--divider-color:\s*[^;]+;/g, '--divider-color: var(--border);');

        // Remove the fixed container width to allow our parent to control size
        styles = styles.replace(/\.container\s*{[^}]+}/g, '.blog-content-wrapper { width: 100%; }');

        return {
            content,
            styles
        };
    } catch (error) {
        console.error('Failed to fetch blog content:', error);
        return null;
    }
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: { date?: string };
}) {
    const params = await searchParams;
    const requestedDate = params.date ? new Date(params.date) : new Date();

    const blogData = await getBlogContent(requestedDate);

    return (
        <main className="min-h-screen bg-background py-16 px-6 transition-colors duration-500">
            <style dangerouslySetInnerHTML={{ __html: blogData?.styles || '' }} />

            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <header className="mb-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl font-dynapuff text-primary">b.blog</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        {format(requestedDate, 'MMMM do, yyyy')}
                    </p>
                </header>

                {blogData ? (
                    <div
                        className="
                            w-full blog-content-wrapper
                            bg-secondary/20 dark:bg-secondary/10 p-4 md:p-8 rounded-[3rem] 
                            border border-border/40 backdrop-blur-md shadow-sm
                            transition-all duration-500 hover:shadow-lg
                            animate-in fade-in zoom-in-95 duration-1000 delay-200
                        "
                    >
                        <div
                            className="max-w-[700px] mx-auto"
                            dangerouslySetInnerHTML={{ __html: blogData.content }}
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-2xl text-center py-24 bg-secondary/10 rounded-[3rem] border border-dashed border-border/40 animate-in fade-in zoom-in-95 duration-1000">
                        <p className="text-muted-foreground text-lg italic">
                            The essence of this day is still unfolding.
                            <br />
                            <span className="text-sm not-italic opacity-60 mt-2 block">Check back later or explore other moments.</span>
                        </p>
                    </div>
                )}

                <footer className="mt-20 text-center opacity-30 text-xs tracking-widest uppercase">
                    just be.
                </footer>
            </div>
        </main>
    );
}
