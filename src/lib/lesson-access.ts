/**
 * The one rule that decides whether a lesson's video is gated.
 *
 * Video is the ONLY gated surface. Lesson text, comments, prev/next navigation
 * and everything in the sitemap stay public to everyone, always.
 */
export function isVideoLocked(input: {
    hasVideo: boolean;
    freePreview: boolean;
    signedIn: boolean;
}): boolean {
    if (!input.hasVideo) return false; // nothing to lock — render nothing, not a gate
    if (input.freePreview) return false; // explicitly opened
    return !input.signedIn;
}
