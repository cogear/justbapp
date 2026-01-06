
'use client';

import Link from 'next/link';
// import { useSearchParams } from 'next/navigation'; // Removed unused
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming generic utility exists, or I can implement class string join manually

export function BlogPagination({
    offset,
    limit,
    total
}: {
    offset: number;
    limit: number;
    total: number;
}) {
    const hasNext = offset + limit < total;
    const hasPrev = offset > 0;
    const prevOffset = Math.max(0, offset - limit);
    const nextOffset = offset + limit;

    return (
        <div className="flex items-center justify-center gap-8 mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Link
                href={`?offset=${prevOffset}`}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                    hasPrev
                        ? "text-primary hover:bg-secondary/20 hover:scale-105"
                        : "text-muted-foreground/30 pointer-events-none"
                )}
                aria-disabled={!hasPrev}
            >
                <ChevronLeft size={18} />
                <span className="uppercase tracking-widest text-sm font-light">Newer</span>
            </Link>

            <span className="text-xs text-muted-foreground/50 tracking-widest font-mono">
                {Math.min(offset + 1, total)} - {Math.min(offset + limit, total)} / {total}
            </span>

            <Link
                href={`?offset=${nextOffset}`}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                    hasNext
                        ? "text-primary hover:bg-secondary/20 hover:scale-105"
                        : "text-muted-foreground/30 pointer-events-none"
                )}
                aria-disabled={!hasNext}
            >
                <span className="uppercase tracking-widest text-sm font-light">Older</span>
                <ChevronRight size={18} />
            </Link>
        </div>
    );
}
