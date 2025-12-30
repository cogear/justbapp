import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { getReframedArticle } from '@/lib/news/service';
import { stackServerApp } from '@/lib/stack';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ cluster?: string }>;
}

export async function generateMetadata({ params, searchParams }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const { cluster } = await searchParams;

    // Attempt to get a default cluster if none provided
    let activeCluster = cluster || 'Balanced';
    if (!cluster) {
        const stackUser = await stackServerApp.getUser();
        if (stackUser?.primaryEmail) {
            const user = await prisma.user.findUnique({
                where: { email: stackUser.primaryEmail || '' },
                include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });
            activeCluster = user?.visualProfiles?.[0]?.cluster || 'Balanced';
        }
    }

    const article = await getReframedArticle(id, activeCluster as string);

    return {
        title: article?.title || 'Article | b.',
        description: article?.summary || 'Read the daily essence.',
    };
}

export default async function IndividualArticlePage({ params, searchParams }: ArticlePageProps) {
    const { id } = await params;
    const { cluster } = await searchParams;

    const stackUser = await stackServerApp.getUser();

    // Determine the cluster to show
    let activeCluster = (typeof cluster === 'string' ? cluster : undefined);
    if (!activeCluster && stackUser?.primaryEmail) {
        const user = await prisma.user.findUnique({
            where: { email: stackUser.primaryEmail },
            include: { visualProfiles: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });
        activeCluster = user?.visualProfiles?.[0]?.cluster;
    }

    activeCluster = activeCluster || 'Balanced';

    const article = await getReframedArticle(id, activeCluster);

    if (!article) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] py-16 px-6 transition-colors duration-500">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Feed
                </Link>

                <article className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <header className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] uppercase tracking-[0.2em] font-bold rounded-full border border-primary/10">
                                    {activeCluster} Perspective
                                </span>
                                <span className="text-muted-foreground text-[10px] uppercase tracking-widest">•</span>
                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-widest font-medium">
                                    <Clock size={12} />
                                    {format(new Date(article.publishedAt), 'MMMM do, yyyy')}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight tracking-tight text-charcoal dark:text-white">
                                {article.title}
                            </h1>
                        </div>

                        <div className="p-6 bg-secondary/5 border-l-4 border-primary/20 rounded-r-2xl italic text-lg text-muted-foreground leading-relaxed">
                            {article.summary}
                        </div>
                    </header>

                    {article.imageUrl && (
                        <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden shadow-2xl">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none prose-serif prose-headings:font-serif">
                        <ReactMarkdown>{article.content}</ReactMarkdown>
                    </div>

                    <footer className="pt-12 border-t border-border/40 space-y-8">
                        <div className="flex flex-wrap gap-3">
                            {article.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 text-muted-foreground text-xs rounded-lg transition-colors hover:bg-muted/50">
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 bg-[#F9FBFB] dark:bg-white/5 rounded-3xl border border-[#E0E6E6] dark:border-white/10">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Source Transparency</p>
                                <p className="text-sm text-muted-foreground">This story was originally published by <span className="font-semibold text-charcoal dark:text-white">{article.source}</span> and has been reframed for your {activeCluster} lens.</p>
                            </div>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-black text-xs font-bold uppercase tracking-widest border border-border shadow-sm rounded-xl hover:shadow-md transition-all active:scale-95"
                            >
                                Original Source <ExternalLink size={14} />
                            </a>
                        </div>
                    </footer>
                </article>

                <div className="mt-24 pt-12 border-t border-border/40 text-center">
                    <p className="text-muted-foreground italic text-sm mb-6">Explore more perspectives</p>
                    <Link
                        href="/news"
                        className="text-primary hover:underline font-serif text-xl"
                    >
                        Back to the daily brief
                    </Link>
                </div>
            </div>
        </main>
    );
}
