/**
 * Shared by the player (src/components/youtube-embed.tsx) and the CLI
 * (scripts/set-lesson-video.ts) so a URL that saves is always a URL that plays.
 *
 * The player renders nothing at all for an unrecognized URL, so a typo would
 * otherwise be an invisible failure.
 */

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeId(input: string): string | null {
    const trimmed = input.trim();

    if (YOUTUBE_ID.test(trimmed)) return trimmed;

    try {
        const url = new URL(trimmed);
        if (url.hostname === 'youtu.be') {
            const id = url.pathname.slice(1);
            return YOUTUBE_ID.test(id) ? id : null;
        }
        if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com')) {
            const v = url.searchParams.get('v');
            if (v && YOUTUBE_ID.test(v)) return v;
            const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
            if (embedMatch) return embedMatch[1];
            const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
            if (shortsMatch) return shortsMatch[1];
        }
    } catch {
        return null;
    }

    return null;
}

export function isDirectVideoUrl(input: string): boolean {
    try {
        const url = new URL(input.trim());
        if (url.protocol !== 'https:') return false;
        return /\.(mp4|m4v|webm|mov)$/i.test(url.pathname);
    } catch {
        return false;
    }
}

/** True when the player will actually render something for this URL. */
export function isPlayableVideoUrl(input: string): boolean {
    return getYouTubeId(input) !== null || isDirectVideoUrl(input);
}
