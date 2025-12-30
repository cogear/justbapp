import React from 'react';
import { Metadata } from 'next';
import { format } from 'date-fns';

export const metadata: Metadata = {
    title: 'b. | Blog',
    description: 'Insights and guidance for the modern world.',
};

async function getBlogContent(date: Date) {
    const year = format(date, 'yyyy');
    const month = format(date, 'MM');
    const day = format(date, 'dd');

    // Pattern: https://justbblog.s3.amazonaws.com/blog/{year}/{month}/{day}/index.html
    const url = `https://justbblog.s3.amazonaws.com/blog/${year}/${month}/${day}/index.html`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            return null;
        }
        return await response.text();
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

    const content = await getBlogContent(requestedDate);

    return (
        <main className="min-h-screen bg-background py-16 px-6 transition-colors duration-500">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <header className="mb-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-5xl font-dynapuff text-primary">b.blog</h1>
                    <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-sm">
                        {format(requestedDate, 'MMMM do, yyyy')}
                    </p>
                </header>

                {content ? (
                    <article
                        className="
                            w-full prose prose-lg dark:prose-invert max-w-none 
                            bg-secondary/20 dark:bg-secondary/10 p-8 md:p-16 rounded-[3rem] 
                            border border-border/40 backdrop-blur-md shadow-sm
                            transition-all duration-500 hover:shadow-lg
                            prose-headings:font-dynapuff prose-headings:text-primary 
                            prose-p:text-foreground/80 prose-p:leading-relaxed
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            animate-in fade-in zoom-in-95 duration-1000 delay-200
                        "
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    <div className="w-full text-center py-24 bg-secondary/10 rounded-[3rem] border border-dashed border-border/40 animate-in fade-in zoom-in-95 duration-1000 delay-200">
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
