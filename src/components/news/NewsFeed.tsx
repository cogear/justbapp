'use client';

import { useState } from 'react';
import { trackInteraction } from '@/app/news/actions';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    originalContent: string;
    source: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
    tags: string[];
    cluster?: string;
    tone?: string;
}

export function NewsFeed({ articles }: { articles: Article[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleExpand = async (article: Article) => {
        if (expandedId === article.id) {
            setExpandedId(null);
        } else {
            setExpandedId(article.id);
            // Track click
            await trackInteraction(article.id, 'CLICK');
        }
    };

    return (
        <div className="space-y-6">
            {articles.map((article) => (
                <motion.article
                    key={article.id}
                    layout
                    className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all ${expandedId === article.id ? 'ring-2 ring-primary/20 shadow-lg' : 'hover:shadow-md'}`}
                >
                    <div
                        onClick={() => handleExpand(article)}
                        className="cursor-pointer p-6 space-y-3"
                    >
                        {/* Header / Meta */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-primary">{article.source}</span>
                                <span>•</span>
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                            {article.tone && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] uppercase tracking-wider font-medium">
                                    {article.tone}
                                </span>
                            )}
                        </div>

                        {/* Title & Summary */}
                        <h2 className="text-xl font-serif font-medium leading-tight group-hover:text-primary transition-colors">
                            {article.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {article.summary}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {article.tags.map(tag => (
                                <span key={tag} className="text-xs text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-md">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                        {expandedId === article.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border/50 bg-muted/10"
                            >
                                <div className="p-6 space-y-6">
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                        <ReactMarkdown>{article.content}</ReactMarkdown>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            Read original source →
                                        </a>
                                        {article.cluster && (
                                            <span className="text-xs text-muted-foreground italic">
                                                Reframed for {article.cluster}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.article>
            ))}
        </div>
    );
}
