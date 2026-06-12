import Link from 'next/link';
import Image from 'next/image';
import type { PortalSize } from '@/lib/portal-layout';

const SIZE_CLASSES: Record<PortalSize, string> = {
    lg: 'md:w-[26rem] p-8 md:p-10',
    md: 'md:w-[20rem] p-7 md:p-8',
    sm: 'md:w-[16rem] p-6 md:p-7',
};

export type PortalCardSpace = {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    type: 'FEED' | 'COURSE';
    memberCount: number;
    lessonCount: number;
};

export function PortalCard({
    space,
    size,
}: {
    space: PortalCardSpace;
    size: PortalSize;
}) {
    const typeLine =
        space.type === 'COURSE'
            ? `course · ${space.lessonCount} quiet ${space.lessonCount === 1 ? 'lesson' : 'lessons'}`
            : `space · ${space.memberCount} ${space.memberCount === 1 ? 'person' : 'people'}`;

    return (
        <Link
            href={`/community/${space.slug}`}
            className={`group block w-full ${SIZE_CLASSES[size]} rounded-[2.5rem] bg-secondary/10 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:bg-secondary/20 transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
        >
            {space.imageUrl && size !== 'sm' && (
                <div className="relative w-full aspect-[5/2] mb-5 rounded-[1.5rem] overflow-hidden">
                    <Image
                        src={space.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 26rem"
                        className="object-cover brightness-[0.95] transition-transform duration-1000 group-hover:scale-105"
                    />
                </div>
            )}
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                {typeLine}
            </p>
            <h2 className="font-georgia text-2xl md:text-3xl text-foreground mb-2 group-hover:text-primary transition-colors duration-500">
                {space.name}
            </h2>
            {space.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {space.description}
                </p>
            )}
        </Link>
    );
}
