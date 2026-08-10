import { portalSlot, portalHeightRem } from '@/lib/portal-layout';
import { PortalCard, type PortalCardSpace } from './portal-card';

/**
 * The community landing: spaces as a free-form drifting field rather than a
 * grid or list. Placement is deterministic (seeded by slug) — no hydration
 * concerns, sane tab order (DOM order = slot order).
 */
export function SpacePortal({ spaces }: { spaces: PortalCardSpace[] }) {
    // Courses first so they land in the larger slots
    const ordered = [...spaces].sort((a, b) =>
        a.type === b.type ? 0 : a.type === 'COURSE' ? -1 : 1
    );

    // The drifting field exists to handle abundance. With a handful of spaces
    // (since the courses moved to /courses) it just strands two bubbles in a
    // void, so small collections use the centered column on every breakpoint.
    const useField = ordered.length > 3;

    return (
        <div className="px-6 pt-20 pb-24 md:pt-24">
            <header className="text-center mb-12 md:mb-16 animate-in fade-in duration-1000">
                <h1 className="font-georgia text-5xl md:text-6xl text-foreground mb-4">
                    the community
                </h1>
                <p className="text-muted-foreground italic font-light">
                    wander in. nothing here is urgent.
                </p>
            </header>

            {/* Gentle vertical flow: always on mobile, everywhere when small */}
            <div
                className={`${useField ? 'md:hidden ' : ''}flex flex-col items-center gap-8 max-w-md mx-auto`}
            >
                {ordered.map((space, i) => (
                    <div
                        key={space.slug}
                        className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000"
                        style={{ animationDelay: `${Math.min(i, 6) * 150}ms`, animationFillMode: 'backwards' }}
                    >
                        <PortalCard space={space} size={space.type === 'COURSE' ? 'lg' : 'md'} />
                    </div>
                ))}
            </div>

            {/* Desktop: the drifting field */}
            {useField && (
                <div
                    className="hidden md:block relative w-full max-w-6xl mx-auto"
                    style={{ minHeight: `${portalHeightRem(ordered.length)}rem` }}
                >
                    {ordered.map((space, i) => {
                        const slot = portalSlot(space.slug, i);
                        return (
                            <div
                                key={space.slug}
                                className={`absolute ${slot.drift} animate-in fade-in zoom-in-95 duration-1000`}
                                style={{
                                    left: `${slot.x}%`,
                                    top: `${(slot.y / 100) * 56}rem`,
                                    animationDelay: `${slot.delay}ms`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <PortalCard space={space} size={slot.size} />
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] italic mt-16">
                breathe … you&rsquo;re here
            </p>
        </div>
    );
}
