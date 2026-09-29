import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Beep } from '../../../js/src/utilities/beep.js';

describe('Beep', () => {
    let audio;

    beforeEach(() => {
        audio = {
            currentTime: 0.5,
            pause: vi.fn(),
            play: vi.fn(() => Promise.resolve()),
        };
        vi.stubGlobal('Audio', vi.fn(function (src) {
            audio.src = src;
            return audio;
        }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('loads a wav once, up front', () => {
        Beep();
        expect(Audio).toHaveBeenCalledOnce();
        expect(audio.src).toMatch(/^data:audio\/wav;base64,/);
    });

    it('rewinds and plays the sound', () => {
        const beep = Beep();
        beep();

        expect(audio.pause).toHaveBeenCalled();
        expect(audio.currentTime).toBe(0);
        expect(audio.play).toHaveBeenCalledOnce();
    });

    it('swallows playback failures', async () => {
        audio.play = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
        const beep = Beep();

        expect(() => beep()).not.toThrow();
        // let the rejected promise settle; an unhandled rejection would fail the run.
        await Promise.resolve();
    });
});
