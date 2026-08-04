import { getYouTubeId, isDirectVideoUrl } from '@/lib/video-url';

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
