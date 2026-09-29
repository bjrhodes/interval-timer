import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Debounce } from '../../../js/src/utilities/debounce.js';

describe('Debounce', () => {
    let debounce;

    beforeEach(() => {
        vi.useFakeTimers();
        debounce = Debounce(window);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('runs the function after the delay', () => {
        const fn = vi.fn();
        debounce(fn, 100, 'save');

        vi.advanceTimersByTime(99);
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledOnce();
    });

    it('ignores repeat calls for the same identifier while one is pending', () => {
        const first = vi.fn();
        const second = vi.fn();
        debounce(first, 100, 'save');
        debounce(second, 100, 'save');

        vi.advanceTimersByTime(100);
        expect(first).toHaveBeenCalledOnce();
        expect(second).not.toHaveBeenCalled();
    });

    it('allows another call once the pending one has run', () => {
        const fn = vi.fn();
        debounce(fn, 100, 'save');
        vi.advanceTimersByTime(100);
        debounce(fn, 100, 'save');
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('tracks different identifiers independently', () => {
        const save = vi.fn();
        const render = vi.fn();
        debounce(save, 100, 'save');
        debounce(render, 50, 'render');

        vi.advanceTimersByTime(50);
        expect(render).toHaveBeenCalledOnce();
        expect(save).not.toHaveBeenCalled();
        vi.advanceTimersByTime(50);
        expect(save).toHaveBeenCalledOnce();
    });
});
