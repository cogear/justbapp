'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, Save, Check, Eye } from 'lucide-react';
import { setLessonVideoUrl } from '@/app/admin/courses/actions';
import { toast } from 'sonner';

interface Props {
    lessonId: string;
    title: string;
    initialVideoUrl: string | null;
    courseSlug: string;
    moduleId: string;
    viewCount: number;
}

export function LessonVideoForm({ lessonId, title, initialVideoUrl, courseSlug, moduleId, viewCount }: Props) {
    const [value, setValue] = useState(initialVideoUrl ?? '');
    const [saved, setSaved] = useState<string | null>(initialVideoUrl);
    const [isPending, startTransition] = useTransition();

    const dirty = (value.trim() || null) !== saved;
    const hasVideo = !!saved;

    const handleSave = () => {
        startTransition(async () => {
            const result = await setLessonVideoUrl(lessonId, value);
            if (result.success) {
                const newSaved = value.trim() === '' ? null : value.trim();
                setSaved(newSaved);
                toast.success(newSaved ? 'Video saved' : 'Video removed');
            } else {
                toast.error(result.error ?? 'Failed to save');
            }
        });
    };

    return (
        <div className="flex items-center gap-3 py-2.5 px-4 hover:bg-muted/30 transition-colors">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hasVideo ? 'var(--color-b-sage, #8DA399)' : 'transparent', border: hasVideo ? 'none' : '1px solid var(--border)' }} />
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <a
                    href={`/community/${courseSlug}?module=${moduleId}&lesson=${lessonId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium truncate hover:text-primary transition-colors"
                    title={title}
                >
                    {title}
                </a>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums w-16 shrink-0" title={`${viewCount} ${viewCount === 1 ? 'view' : 'views'}`}>
                <Eye size={12} />
                {viewCount.toLocaleString()}
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && dirty && !isPending) handleSave();
                }}
                placeholder="https://youtu.be/…"
                className="flex-1 max-w-md bg-background border border-border rounded-md px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
            />
            {saved && (
                <a
                    href={saved}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Open video"
                >
                    <ExternalLink size={14} />
                </a>
            )}
            <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shrink-0"
            >
                {isPending ? (
                    <>Saving…</>
                ) : !dirty && saved ? (
                    <><Check size={12} /> Saved</>
                ) : (
                    <><Save size={12} /> Save</>
                )}
            </button>
        </div>
    );
}
