'use client';

import React from 'react';

interface NewsCardProps {
    title: string;
    summary: string;
    source: string;
    url: string;
}

export default function NewsCard({ title, summary, source, url }: NewsCardProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
                block w-full bg-secondary/60 backdrop-blur-sm rounded-2xl p-6
                border border-border/50
                hover:shadow-md hover:bg-secondary/80 hover:scale-[1.01]
                transition-all duration-300
                group
            "
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-wider text-primary uppercase">
                        {source}
                    </span>

                </div>

                <h3 className="text-lg font-serif text-foreground leading-snug group-hover:text-primary transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary}
                </p>
            </div>
        </a>
    );
}
