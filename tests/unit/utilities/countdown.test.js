import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Countdown } from '../../../js/src/utilities/countdown.js';

// fake animation frames fire every 16ms, so allow a frame for the countdown to notice.
const frame = 16;
const advance = (ms) => vi.advanceTimersByTime(ms + frame);

describe('Countdown', () => {
    let countdown, complete, update;

    beforeEach(() => {
        vi.useFakeTimers({
            toFake: ['performance', 'requestAnimationFrame', 'cancelAnimationFrame'],
        });
        countdown = Countdown();
        complete = vi.fn();
        update = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('completes immediately when there is nothing to count', () => {
        countdown.init(0, complete, update);
        expect(complete).toHaveBeenCalledOnce();
        expect(update).not.toHaveBeenCalled();
    });

    it('does nothing until started', () => {
        countdown.init(3, complete, update);
        vi.advanceTimersByTime(5000);
        expect(update).not.toHaveBeenCalled();
        expect(complete).not.toHaveBeenCalled();
    });

    it('notifies each second remaining, then completes', () => {
        countdown.init(3, complete, update);
        countdown.start();

        advance(1000);
        expect(update).toHaveBeenLastCalledWith(2);
        advance(1000);
        expect(update).toHaveBeenLastCalledWith(1);
        expect(complete).not.toHaveBeenCalled();
        advance(1000);
        expect(update).toHaveBeenLastCalledWith(0);
        expect(complete).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(5000);
        expect(update).toHaveBeenCalledTimes(3);
    });

    it('resumes a paused count with the time that was left in the second', () => {
        countdown.init(3, complete, update);
        countdown.start();
        vi.advanceTimersByTime(1500);
        expect(update).toHaveBeenCalledTimes(1);

        countdown.pause();
        vi.advanceTimersByTime(10000);
        expect(update).toHaveBeenCalledTimes(1);

        countdown.start();
        vi.advanceTimersByTime(400);
        expect(update).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(200);
        expect(update).toHaveBeenLastCalledWith(1);
    });

    it('restarts cleanly when re-initialised mid count', () => {
        countdown.init(10, complete, update);
        countdown.start();
        vi.advanceTimersByTime(2000);

        const nextComplete = vi.fn();
        countdown.init(1, nextComplete, update);
        countdown.start();
        advance(1000);

        expect(nextComplete).toHaveBeenCalledOnce();
        expect(complete).not.toHaveBeenCalled();
    });
});
