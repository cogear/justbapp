function getYouTubeId(input: string): string | null {
    const trimmed = input.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    try {
        const url = new URL(trimmed);
        if (url.hostname === 'youtu.be') {
            const id = url.pathname.slice(1);
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }
        if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com')) {
            const v = url.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
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

function isDirectVideoUrl(input: string): boolean {
    try {
        const url = new URL(input.trim());
        if (url.protocol !== 'https:') return false;
        return /\.(mp4|m4v|webm|mov)$/i.test(url.pathname);
    } catch {
        return false;
    }
}

export function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
    const id = getYouTubeId(url);

    // Direct video file (e.g. S3 render) — play natively until it moves to YouTube.
    if (!id && isDirectVideoUrl(url)) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow bg-black">
                <video
                    src={url.trim()}
                    title={title ?? 'Lesson video'}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full"
                />
            </div>
        );
    }

    if (!id) return null;

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={title ?? 'Lesson video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
            />
        </div>
    );
}
