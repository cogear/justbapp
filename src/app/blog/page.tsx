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

        // Extract the main content and any styles
        const content = $('article.container').html() || $('body').html() || '';
        const styles = $('style').html() || '';

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
        <main className="min-h-screen bg-background py-16 px-4 md:px-6 flex justify-center">
            <style dangerouslySetInnerHTML={{ __html: blogData?.styles || '' }} />

            <div className="w-full max-w-4xl flex flex-col items-center">
                <header className="mb-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl font-georgia text-primary">b.blog</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        {format(requestedDate, 'MMMM do, yyyy')}
                    </p>
                </header>

                {blogData ? (
                    <div
                        className="
                            w-full
                            bg-secondary/20 dark:bg-secondary/10 p-4 md:p-12 rounded-[3rem] 
                            border border-border/40 backdrop-blur-md shadow-sm
                            flex justify-center
                            animate-in fade-in zoom-in-95 duration-1000 delay-200
                        "
                    >
                        <div
                            className="w-full max-w-[800px] overflow-hidden"
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
