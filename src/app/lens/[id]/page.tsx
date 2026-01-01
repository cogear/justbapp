import { getReframedArticle } from '@/lib/news/service';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default async function PublicLensPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ cluster?: string }>
}) {
    const { id } = await params;
    const { cluster } = await searchParams;

    if (!cluster) {
        return notFound();
    }

    const article = await getReframedArticle(id, cluster);

    if (!article) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-background p-6 md:p-12 font-sans max-w-3xl mx-auto">
            <header className="mb-12 space-y-6 text-center">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mx-auto"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to the b life.
                </Link>

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <span className="px-4 py-1.5 bg-primary/5 text-primary text-[11px] uppercase tracking-[0.2em] font-bold rounded-full border border-primary/10 shadow-sm">
                            {article.cluster} Lens
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-georgia font-bold tracking-tight leading-tight max-w-2xl mx-auto">
                            {article.title}
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{format(new Date(article.publishedAt), 'MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
            </header>

            {article.imageUrl && (
                <div className="aspect-video w-full rounded-3xl overflow-hidden mb-12 bg-muted shadow-xl border border-border">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <article className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg">
                <ReactMarkdown>{article.content}</ReactMarkdown>
            </article>

            <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Original Story</p>
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline flex items-center gap-1.5"
                    >
                        Read on {article.source} <ExternalLink size={14} />
                    </a>
                </div>

                <div className="text-center sm:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your Daily Briefing</p>
                    <Link href="/news" className="text-sm font-georgia font-bold hover:underline">
                        the b life.
                    </Link>
                </div>
            </footer>
        </main>
    );
}
