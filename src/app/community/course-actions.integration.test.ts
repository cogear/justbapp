// Proves the video gate is enforced SERVER-SIDE. This is the acceptance test for
// the feature: `course-view.tsx` is a client component that fetches the video via
// this server action, so if the action ever returns `videoUrl` to a signed-out
// caller, the URL is readable straight out of the network response and the gate
// is decorative.
//
// Runs against the current database, read-only apart from the `viewCount`
// increment that `getLessonContent` fires — which is restored in afterAll.

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import prisma from '@/lib/prisma';

const getUser = vi.fn();
vi.mock('@/lib/stack', () => ({
    stackServerApp: {
        getUser: () => getUser(),
    },
}));

// Imported after the mock so the action picks up the stubbed stack app.
const { getLessonContent } = await import('./course-actions');

describe('getLessonContent video gate (integration)', () => {
    let gatedId: string | undefined;
    let freeId: string | undefined;
    const originalViewCounts = new Map<string, number>();

    beforeAll(async () => {
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set for integration test');

        const gated = await prisma.lesson.findFirst({
            where: { freePreview: false, NOT: { videoUrl: null } },
            select: { id: true, viewCount: true },
        });
        const free = await prisma.lesson.findFirst({
            where: { freePreview: true, NOT: { videoUrl: null } },
            select: { id: true, viewCount: true },
        });
        if (!gated || !free) throw new Error('Need at least one gated and one free lesson with a video');

        gatedId = gated.id;
        freeId = free.id;
        originalViewCounts.set(gated.id, gated.viewCount);
        originalViewCounts.set(free.id, free.viewCount);
    });

    afterAll(async () => {
        // Don't leave this test's reads inflating the admin view counts.
        for (const [id, viewCount] of originalViewCounts) {
            await prisma.lesson.update({ where: { id }, data: { viewCount } });
        }
    });

    it('withholds the video URL from a signed-out viewer', async () => {
        getUser.mockResolvedValue(null);

        const lesson = await getLessonContent(gatedId!);

        expect(lesson).not.toBeNull();
        expect(lesson!.locked).toBe(true);
        expect(lesson!.hasVideo).toBe(true);
        expect(lesson!.videoUrl).toBeNull();
        // Nothing video-shaped anywhere in the payload that crosses the wire.
        expect(JSON.stringify(lesson)).not.toMatch(/\.mp4|\.webm|\.mov|youtu/i);
    });

    it('returns the video URL to a signed-in viewer', async () => {
        getUser.mockResolvedValue({ id: 'stack-user-1', primaryEmail: 'someone@example.com' });

        const lesson = await getLessonContent(gatedId!);

        expect(lesson!.locked).toBe(false);
        expect(lesson!.videoUrl).toBeTruthy();
    });

    it('keeps a free-preview lesson open to signed-out viewers', async () => {
        getUser.mockResolvedValue(null);

        const lesson = await getLessonContent(freeId!);

        expect(lesson!.locked).toBe(false);
        expect(lesson!.videoUrl).toBeTruthy();
    });

    it('still serves the lesson text when the video is locked', async () => {
        getUser.mockResolvedValue(null);

        const lesson = await getLessonContent(gatedId!);

        // The gate is video-only — the writing stays public.
        expect(lesson!.title).toBeTruthy();
        expect(lesson!.content).toBeTruthy();
    });
});
