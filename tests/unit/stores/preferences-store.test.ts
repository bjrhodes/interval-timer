import { beforeEach, describe, expect, it, vi } from 'vitest';
import { preferences, upgrade } from '../../../src/stores/preferences-store.ts';
import { memoryDb, type Db } from '../../../src/utilities/idb.ts';
import type { Reporter, StoreDeps } from '../../../src/types.ts';

const factoryWith = (db: Promise<Db>, reportError: Reporter = vi.fn()): StoreDeps => ({
    database: () => db,
    errorReporter: () => reportError,
});

describe('preferences store', () => {
    let store: ReturnType<typeof preferences>;

    beforeEach(() => {
        store = preferences({}, factoryWith(Promise.resolve(memoryDb({ preferences: [] }))));
    });

    it('starts empty', async () => {
        expect(await store.get()).toEqual({ id: 'preferences' });
    });

    it('gives back what was saved', async () => {
        await store.save({ timerMode: 'power' });
        expect(await store.get()).toEqual({ id: 'preferences', timerMode: 'power' });
    });

    it('waits for a save still in flight before reading', async () => {
        store.save({ timerMode: 'power' });
        expect((await store.get()).timerMode).toBe('power');
    });

    it('copies what it saves, so the caller can keep changing theirs', async () => {
        const prefs = { power: { points: [1, 2, 3] } };
        const saving = store.save(prefs);
        prefs.power.points.push(4);
        await saving;
        expect((await store.get()).power?.points).toEqual([1, 2, 3]);
    });

    it('falls back to memory, and says so, when the database will not open', async () => {
        const reportError = vi.fn();
        store = preferences({}, factoryWith(Promise.reject(new Error('blocked')), reportError));
        await store.save({ timerMode: 'power' });
        expect((await store.get()).timerMode).toBe('power');
        expect(reportError).toHaveBeenCalledOnce();
    });
});

describe('preferences upgrade', () => {
    it('adds the store to new and version 1 databases only', () => {
        [0, 1, 2].forEach((oldVersion) => {
            const db = { createObjectStore: vi.fn() };
            upgrade(db as unknown as IDBDatabase, oldVersion);
            expect(db.createObjectStore).toHaveBeenCalledTimes(oldVersion < 2 ? 1 : 0);
        });
    });
});
