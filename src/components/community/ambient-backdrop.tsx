'use client';

import { usePathname, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();

    const slug = pathname.split('/')[2];
    const variant: AmbientVariant = !slug
        ? 'portal'
        : spaceTypes[slug] === 'COURSE'
          ? searchParams.get('lesson')
              ? 'lesson'
              : 'course'
          : 'feed';

    return (
        <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
            <AmbientScene variant={variant} />
        </div>
    );
}
