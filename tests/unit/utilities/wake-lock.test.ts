import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { WakeLock } from '../../../src/utilities/wake-lock.ts';

interface FakeLock {
    release: Mock<() => Promise<void>>;
    addEventListener: Mock;
}

// just what WakeLock touches.
interface FakeWindow {
    navigator: { wakeLock: { request: Mock<() => Promise<FakeLock>> } };
    document: { visibilityState: string; addEventListener: Mock };
}

describe('WakeLock', () => {
    let win: FakeWindow, locks: FakeLock[], listeners: (() => void)[];

    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

    const makeLock = () => {
        const handlers: (() => void)[] = [];
        const lock = {
            release: vi.fn(() => {
                handlers.forEach((handler) => handler());
                return Promise.resolve();
            }),
            addEventListener: vi.fn((type: string, handler: () => void) => handlers.push(handler)),
        };
        locks.push(lock);
        return lock;
    };

    const setVisibility = (state: string) => {
        win.document.visibilityState = state;
        listeners.forEach((listener) => listener());
    };

    const create = () => WakeLock(win as unknown as Window);

    beforeEach(() => {
        locks = [];
        listeners = [];
        win = {
            navigator: { wakeLock: { request: vi.fn(() => Promise.resolve(makeLock())) } },
            document: {
                visibilityState: 'visible',
                addEventListener: vi.fn((type: string, listener: () => void) => listeners.push(listener)),
            },
        };
    });

    it('asks for a screen lock', async () => {
        create().acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledExactlyOnceWith('screen');
    });

    it('only holds one lock however often it is acquired', async () => {
        const wakeLock = create();
        wakeLock.acquire();
        wakeLock.acquire();
        await settle();
        wakeLock.acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledOnce();
    });

    it('lets go of the lock on release', async () => {
        const wakeLock = create();
        wakeLock.acquire();
        await settle();
        wakeLock.release();

        expect(locks[0].release).toHaveBeenCalledOnce();
    });

    it('lets go of a lock that arrives after release', async () => {
        const wakeLock = create();
        wakeLock.acquire();
        wakeLock.release();
        await settle();

        expect(locks[0].release).toHaveBeenCalledOnce();
    });

    it('takes the lock again when the page comes back into view', async () => {
        create().acquire();
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
        const wakeLock = create();
        wakeLock.acquire();
        await settle();
        wakeLock.release();

        setVisibility('visible');
        await settle();
        expect(win.navigator.wakeLock.request).toHaveBeenCalledOnce();
    });

    it('does not ask while the page is hidden', async () => {
        win.document.visibilityState = 'hidden';
        create().acquire();
        await settle();

        expect(win.navigator.wakeLock.request).not.toHaveBeenCalled();
    });

    it('swallows refusals, and tries again later', async () => {
        win.navigator.wakeLock.request = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
        const wakeLock = create();
        wakeLock.acquire();
        await settle();
        wakeLock.acquire();
        await settle();

        expect(win.navigator.wakeLock.request).toHaveBeenCalledTimes(2);
    });

    it('does nothing where the API is missing', () => {
        delete (win.navigator as Partial<FakeWindow['navigator']>).wakeLock;
        const wakeLock = create();

        expect(() => {
            wakeLock.acquire();
            wakeLock.release();
        }).not.toThrow();
        expect(win.document.addEventListener).not.toHaveBeenCalled();
    });
});
