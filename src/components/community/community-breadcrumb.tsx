'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home } from 'lucide-react';

type BreadcrumbSpace = {
    name: string;
    slug: string;
    type: 'FEED' | 'COURSE';
    modules: { id: string; title: string }[];
};

/**
 * Floating wayfinding pill — the only navigation chrome inside a space.
 * Hidden on the portal itself (/community is home).
 */
export function CommunityBreadcrumb({ spaces }: { spaces: BreadcrumbSpace[] }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const slug = pathname.split('/')[2];
    if (!slug) return null; // on the portal

    const space = spaces.find((s) => s.slug === slug);
    if (!space) return null;

    const moduleId = searchParams.get('module');
    const lessonId = searchParams.get('lesson');
    const moduleTitle = moduleId
        ? space.modules.find((m) => m.id === moduleId)?.title
        : null;

    return (
        <nav
            aria-label="Community navigation"
            className="fixed z-40 top-[4.5rem] left-4 md:left-8 animate-in fade-in slide-in-from-top-2 duration-700"
        >
            <div className="inline-flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-md border border-border/40 shadow-sm px-4 py-2 text-sm max-w-[calc(100vw-2rem)]">
                <Link
                    href="/community"
                    aria-label="Back to all spaces"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                    <Home size={15} />
                </Link>
                <span className="text-border select-none">·</span>
                {moduleTitle ? (
                    <Link
                        href={`/community/${space.slug}`}
                        className="text-muted-foreground hover:text-primary transition-colors font-georgia whitespace-nowrap"
                    >
                        {space.name}
                    </Link>
                ) : (
                    <span className="text-foreground font-georgia whitespace-nowrap">{space.name}</span>
                )}
                {moduleTitle && (
                    <>
                        <span className="text-border select-none">·</span>
                        {lessonId ? (
                            <Link
                                href={`/community/${space.slug}?module=${moduleId}`}
                                className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[10rem] md:max-w-[16rem]"
                            >
                                {moduleTitle}
                            </Link>
                        ) : (
                            <span className="text-foreground truncate max-w-[10rem] md:max-w-[16rem]">
                                {moduleTitle}
                            </span>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}
