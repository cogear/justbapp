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
        <main className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl font-dynapuff text-primary">b.blog</h1>
                    <p className="text-muted-foreground font-light tracking-widest uppercase">
                        {format(requestedDate, 'MMMM do, yyyy')}
                    </p>
                </header>

                {content ? (
                    <article
                        className="prose prose-lg dark:prose-invert max-w-none 
                        bg-secondary/10 p-8 md:p-12 rounded-[2.5rem] border border-border/40 
                        backdrop-blur-sm shadow-sm
                        prose-headings:font-dynapuff prose-headings:text-primary 
                        prose-p:text-foreground/80 prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    <div className="text-center py-20 bg-secondary/10 rounded-[2.5rem] border border-dashed border-border">
                        <p className="text-muted-foreground">
                            No blog post found for this date.
                            <br />
                            Check back later or explore other days.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
