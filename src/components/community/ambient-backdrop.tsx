'use client';

import { usePathname } from 'next/navigation';
import { AmbientScene, type AmbientVariant } from './ambient-scene';

export type { AmbientVariant, AmbientMode } from './ambient-scene';

/**
 * Community-wide fixed backdrop: derives the scene intensity variant from
 * the current route and renders the shared AmbientScene full-viewport.
 */
export function AmbientBackdrop({
    spaceTypes,
}: {
    spaceTypes: Record<string, 'FEED' | 'COURSE'>;
}) {
    const pathname = usePathname();

    // /community/[space]/[module]/[lesson] — a lesson is the 4th segment.
    // Previously read from ?lesson=; the variant selection is unchanged.
    const [, , slug, , lessonSlug] = pathname.split('/');
    const variant: AmbientVariant = !slug
        ? 'portal'
        : spaceTypes[slug] === 'COURSE'
          ? lessonSlug
              ? 'lesson'
              : 'course'
          : 'feed';

    return (
        <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
            <AmbientScene variant={variant} />
        </div>
    );
}
