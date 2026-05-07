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

export function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
    const id = getYouTubeId(url);
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
