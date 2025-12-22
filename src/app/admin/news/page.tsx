import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { Mail, Calendar, ExternalLink, Share2, Eye, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default async function AdminNewsPage() {
    const articles = await prisma.newsArticle.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 50,
        include: {
            reframedArticles: true
        }
    });

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-light">News Manager</h1>
                        <p className="text-muted-foreground text-sm mt-1">{articles.length} latest articles synced</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/events" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90">
                            Back to Events
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {articles.map((article) => (
                        <div key={article.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                            {article.imageUrl && (
                                <div className="md:w-48 h-32 md:h-auto shrink-0 bg-muted">
                                    <img
                                        src={article.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar size={12} />
                                            {format(article.publishedAt, 'MMM d, yyyy')}
                                            <span>•</span>
                                            {article.source}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium leading-tight mb-2">{article.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lenses:</span>
                                        <div className="flex gap-1">
                                            {article.reframedArticles.map(r => (
                                                <Link
                                                    key={r.id}
                                                    href={`/lens/${article.id}?cluster=${encodeURIComponent(r.cluster)}`}
                                                    target="_blank"
                                                    className="px-2 py-1 bg-secondary hover:bg-muted text-[10px] rounded transition-colors flex items-center gap-1"
                                                    title={`View ${r.cluster} Lens`}
                                                >
                                                    {r.cluster}
                                                    <Eye size={10} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="ml-auto flex items-center gap-2">
                                        <a
                                            href={article.originalUrl}
                                            target="_blank"
                                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                            title="View Original"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Client-side script for the copy button would be better, 
// but for a simple admin we can just use the onClick inline or a dedicated component.
// Re-visiting: Let's use a server-only view and keep it simple.
