/**
 * Deterministic, hydration-safe placement for the community space portal.
 * A fixed slot table (loose descending zigzag, in percent coordinates) is
 * jittered per-space using a hash of the slug — pure function, no
 * Math.random(), identical output on every render.
 */

export type PortalSize = 'lg' | 'md' | 'sm';

export type PortalSlot = {
    /** left offset, percent of container width */
    x: number;
    /** top offset, percent of container height */
    y: number;
    size: PortalSize;
    /** drift keyframe class */
    drift: 'drift-a' | 'drift-b' | 'drift-c';
    /** entrance stagger, ms */
    delay: number;
};

// Hand-tuned slots: two loose columns, pitched for cards WITH 5:2 image
// headers (lg ≈ 26rem tall, md ≈ 20rem). Same-column neighbors sit two slots
// apart, so consecutive same-side deltas clear a full card plus breathing
// room even after jitter. Retuned 2026-08-07 when the portal grew to nine
// spaces and cards gained imagery — the old table was pitched for short
// text-only cards and overlapped.
const SLOTS: { x: number; y: number; size: PortalSize }[] = [
    { x: 8, y: 0, size: 'lg' },
    { x: 56, y: 26, size: 'md' },
    { x: 12, y: 52, size: 'md' },
    { x: 54, y: 76, size: 'lg' },
    { x: 8, y: 104, size: 'sm' },
    { x: 50, y: 126, size: 'md' },
    { x: 14, y: 148, size: 'md' },
    { x: 58, y: 172, size: 'sm' },
    { x: 10, y: 194, size: 'md' },
    { x: 54, y: 216, size: 'md' },
];

const DRIFTS = ['drift-a', 'drift-b', 'drift-c'] as const;

/** FNV-1a 32-bit hash. */
function fnv1a(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/** mulberry32 PRNG — deterministic from seed. */
function mulberry32(seed: number): () => number {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Slot for the space at `index`, jittered by its slug.
 * Course spaces get priority for the large slots via the caller's ordering.
 */
export function portalSlot(slug: string, index: number): PortalSlot {
    const base = SLOTS[index % SLOTS.length];
    const rand = mulberry32(fnv1a(slug));

    return {
        x: base.x + (rand() * 4 - 2), // ±2% — organic drift without collision risk
        y: base.y + (rand() * 2 - 1), // vertical jitter kept tight; spacing lives in the slot table
        size: base.size,
        drift: DRIFTS[Math.floor(rand() * DRIFTS.length)],
        delay: Math.min(index, 6) * 150,
    };
}

/** Container bottom padding (percent-ish height budget) for N cards. */
export function portalHeightRem(count: number): number {
    // Container must clear the last slot's top plus a full card height.
    const used = SLOTS[Math.min(count, SLOTS.length) - 1]?.y ?? 0;
    return Math.max(42, (used / 100) * 56 + 30);
}
