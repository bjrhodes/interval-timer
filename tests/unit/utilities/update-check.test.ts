import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { UpdateCheck } from '../../../src/utilities/update-check.ts';

// just what UpdateCheck touches.
interface FakeWindow {
    fetch: Mock;
    location: { reload: Mock };
    document: { visibilityState: string; querySelector: Mock; addEventListener: Mock };
}

describe('UpdateCheck', () => {
    let win: FakeWindow, listeners: (() => void)[], busy: boolean, latest: string;

    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

    const setVisibility = (state: string) => {
        win.document.visibilityState = state;
        listeners.forEach((listener) => listener());
    };

    const check = () => UpdateCheck(win as unknown as Window, () => busy);

    beforeEach(() => {
        listeners = [];
        busy = false;
        latest = 'abc1234\n';
        win = {
            fetch: vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(latest) })),
            location: { reload: vi.fn() },
            document: {
                visibilityState: 'hidden',
                querySelector: vi.fn(() => ({ getAttribute: () => 'abc1234' })),
                addEventListener: vi.fn((type: string, listener: () => void) => listeners.push(listener)),
            },
        };
    });

    it('reloads when a new version is live and the page comes back into view', async () => {
        latest = 'def5678\n';
        check();
        setVisibility('visible');
        await settle();

        expect(win.fetch).toHaveBeenCalledExactlyOnceWith('version.txt', { cache: 'no-store' });
        expect(win.location.reload).toHaveBeenCalledOnce();
    });

    it('stays put when the version is the same', async () => {
        check();
        setVisibility('visible');
        await settle();

        expect(win.location.reload).not.toHaveBeenCalled();
    });

    it('does not check while the page is hidden', async () => {
        check();
        setVisibility('hidden');
        await settle();

        expect(win.fetch).not.toHaveBeenCalled();
    });

    it('does not interrupt a busy view', async () => {
        latest = 'def5678';
        busy = true;
        check();
        setVisibility('visible');
        await settle();

        expect(win.location.reload).not.toHaveBeenCalled();
    });

    it('does not reload when the view became busy during the check', async () => {
        latest = 'def5678';
        check();
        setVisibility('visible');
        busy = true;
        await settle();

        expect(win.location.reload).not.toHaveBeenCalled();
    });

    it('carries on when the check fails', async () => {
        win.fetch = vi.fn(() => Promise.reject(new TypeError('offline')));
        check();
        setVisibility('visible');
        await settle();

        expect(win.location.reload).not.toHaveBeenCalled();
    });

    it('ignores an error response', async () => {
        win.fetch = vi.fn(() => Promise.resolve({ ok: false, text: () => Promise.resolve('Not found') }));
        check();
        setVisibility('visible');
        await settle();

        expect(win.location.reload).not.toHaveBeenCalled();
    });

    it('does nothing where the page has no version, e.g. locally', () => {
        win.document.querySelector = vi.fn(() => ({ getAttribute: () => '' }));
        check();

        expect(win.document.addEventListener).not.toHaveBeenCalled();
    });
});
