/**
 * URL slug from a human-readable title.
 *
 * IMPORTANT: this function's output is a permanent public URL. Once a module or
 * lesson slug has been published and crawled, changing how this transform works
 * silently changes every affected URL — which breaks inbound links and discards
 * whatever ranking those pages had earned. Do not adjust the rules here without
 * a redirect plan for every slug that would change (see
 * `scripts/backfill-course-slugs.ts --reslug`, which prints an old→new map).
 */
export function slugify(input: string, opts?: { maxLength?: number }): string {
    const max = opts?.maxLength ?? 80;

    const slug = input
        // Decompose accents so the combining marks can be stripped: é -> e + ´
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        // Apostrophes vanish rather than becoming separators, so "Oldenburg's"
        // is "oldenburgs" and not "oldenburg-s".
        .replace(/[‘’ʼ'`´]/g, '')
        // en/em/figure dashes behave as word separators
        .replace(/[‒–—]/g, '-')
        .replace(/&/g, ' and ')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');

    if (slug.length <= max) return slug;

    // Truncate on a word boundary — never mid-word.
    return slug.slice(0, max).replace(/-[^-]*$/, '').replace(/-+$/, '');
}
