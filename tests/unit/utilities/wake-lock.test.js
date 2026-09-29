import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WakeLock } from '../../../js/src/utilities/wake-lock.js';

describe('WakeLock', () => {
    let win, locks, listeners;

    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

    const makeLock = () => {
        const handlers = [];
        const lock = {
            release: vi.fn(() => {
                handlers.forEach((handler) => handler());
                return Promise.resolve();
            }),
            addEventListener: vi.fn((type, handler) => handlers.push(handler)),
        };
        locks.push(lock);
        return lock;
    };

    const setVisibility = (state) => {
        win.document.visibilityState = state;
        listeners.forEach((listener) => listener());
    };

    beforeEach(() => {
        locks = [];
        listeners = [];
        win = {
            navigator: { wakeLock: { request: vi.fn(() => Promise.resolve(makeLock())) } },
            document: {
                visibilityState: 'visible',
                addEventListener: vi.fn((type, listener) => listeners.push(listener)),
            },
        };
    });

    it('asks for a screen lock', async () => {
        WakeLock(win).acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledExactlyOnceWith('screen');
    });

    it('only holds one lock however often it is acquired', async () => {
        const wakeLock = WakeLock(win);
        wakeLock.acquire();
        wakeLock.acquire();
        await settle();
        wakeLock.acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledOnce();
    });

    it('lets go of the lock on release', async () => {
        const wakeLock = WakeLock(win);
        wakeLock.acquire();
        await settle();
        wakeLock.release();

        expect(locks[0].release).toHaveBeenCalledOnce();
    });

    it('lets go of a lock that arrives after release', async () => {
        const wakeLock = WakeLock(win);
        wakeLock.acquire();
        wakeLock.release();
        await settle();

        expect(locks[0].release).toHaveBeenCalledOnce();
    });

    it('takes the lock again when the page comes back into view', async () => {
        WakeLock(win).acquire();
        await settle();

        // the browser drops the lock when the page is hidden.
        locks[0].release();
        setVisibility('hidden');
        await settle();
        expect(win.navigator.wakeLock.request).toHaveBeenCalledOnce();

        setVisibility('visible');
        await settle();
        expect(win.navigator.wakeLock.request).toHaveBeenCalledTimes(2);
    });

    it('stays released when the page comes back into view after release', async () => {
        const wakeLock = WakeLock(win);
        wakeLock.acquire();
        await settle();
        wakeLock.release();

        setVisibility('visible');
        await settle();
        expect(win.navigator.wakeLock.request).toHaveBeenCalledOnce();
    });

    it('does not ask while the page is hidden', async () => {
        win.document.visibilityState = 'hidden';
        WakeLock(win).acquire();
        await settle();

        expect(win.navigator.wakeLock.request).not.toHaveBeenCalled();
    });

    it('swallows refusals, and tries again later', async () => {
        win.navigator.wakeLock.request = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
        const wakeLock = WakeLock(win);
        wakeLock.acquire();
        await settle();
        wakeLock.acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledTimes(2);
    });

    it('does nothing where the API is missing', () => {
        delete win.navigator.wakeLock;
        const wakeLock = WakeLock(win);

        expect(() => {
            wakeLock.acquire();
            wakeLock.release();
        }).not.toThrow();
        expect(win.document.addEventListener).not.toHaveBeenCalled();
    });
});
