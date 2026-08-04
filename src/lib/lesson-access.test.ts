import { describe, expect, it } from 'vitest';
import { isVideoLocked } from './lesson-access';

describe('isVideoLocked', () => {
    it('locks a gated video for a signed-out visitor', () => {
        expect(isVideoLocked({ hasVideo: true, freePreview: false, signedIn: false })).toBe(true);
    });

    it('opens a gated video once signed in', () => {
        expect(isVideoLocked({ hasVideo: true, freePreview: false, signedIn: true })).toBe(false);
    });

    it('opens a free-preview video to everyone', () => {
        expect(isVideoLocked({ hasVideo: true, freePreview: true, signedIn: false })).toBe(false);
        expect(isVideoLocked({ hasVideo: true, freePreview: true, signedIn: true })).toBe(false);
    });

    // Load-bearing: most lessons have no video and must render exactly as before —
    // no gate panel, no empty box.
    it('never locks a lesson that has no video', () => {
        for (const freePreview of [true, false]) {
            for (const signedIn of [true, false]) {
                expect(isVideoLocked({ hasVideo: false, freePreview, signedIn })).toBe(false);
            }
        }
    });
});
